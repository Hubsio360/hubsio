
import { setHours, setMinutes } from 'date-fns';
import { isValidUUID } from './interviewUtils';
import { isDuringLunch } from './interviewUtils';
import { deleteExistingInterviews, createInterviewsInDB, fetchInterviewsFromDB, InterviewInsert } from './interviewDbOps';

/**
 * Generate an audit plan with interviews
 */
export const generatePlanSchedule = async (
  auditId: string, 
  startDate: string, 
  endDate: string, 
  options?: {
    topicIds?: string[];
    selectedDays?: string[];
    themeDurations?: Record<string, number>;
    maxHoursPerDay?: number;
  }
): Promise<boolean> => {
  try {
    console.log(`Generating audit plan for audit ID: ${auditId} with options:`, options);
    
    if (!auditId) {
      console.error('No audit ID provided for plan generation');
      return false;
    }
    
    const maxHoursPerDay = options?.maxHoursPerDay || 8;
    const selectedDays = options?.selectedDays || [];
    const topicIds = options?.topicIds || [];
    const themeDurations = options?.themeDurations || {};
    
    if (selectedDays.length === 0) {
      console.error('No days selected for the audit plan');
      return false;
    }
    
    if (!isValidUUID(auditId)) {
      console.error(`Invalid UUID format for auditId: ${auditId}`);
      return false;
    }
    
    // Delete existing interviews first
    const deleteResult = await deleteExistingInterviews(auditId);
    if (!deleteResult) {
      return false;
    }
    
    // Sort selected days chronologically
    const sortedDays = [...selectedDays].sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    // Create database-ready interview objects
    const dbInterviewsToCreate: InterviewInsert[] = [];
    
    // First day - Opening meeting
    const firstDay = new Date(sortedDays[0]);
    setHours(firstDay, 9);
    setMinutes(firstDay, 0);
    
    dbInterviewsToCreate.push({
      audit_id: auditId,
      title: "Réunion d'ouverture",
      description: "Présentation de l'audit et des objectifs",
      start_time: firstDay.toISOString(),
      duration_minutes: 60,
      location: "Salle de réunion principale"
    });
    
    // Schedule topic interviews
    let currentDay = 0;
    let currentTime = new Date(sortedDays[currentDay]);
    setHours(currentTime, 10);
    setMinutes(currentTime, 0);
    
    const getNextTimeSlot = (currentTime: Date, durationMinutes: number): Date => {
      let nextTime = new Date(currentTime);
      nextTime = new Date(nextTime.getTime() + durationMinutes * 60000);
      
      if (isDuringLunch(nextTime) || (isDuringLunch(currentTime) && isDuringLunch(nextTime))) {
        nextTime = new Date(nextTime);
        setHours(nextTime, 13);
        setMinutes(nextTime, 30);
      }
      
      if (nextTime.getHours() >= 17) {
        currentDay++;
        
        if (currentDay >= sortedDays.length) {
          console.log("Warning: Not enough days to schedule all interviews");
          currentDay = sortedDays.length - 1; // Fallback to last day
        }
        
        nextTime = new Date(sortedDays[currentDay]);
        setHours(nextTime, 9);
        setMinutes(nextTime, 0);
      }
      
      return nextTime;
    };
    
    for (const topicId of topicIds) {
      const duration = themeDurations[topicId] || 60;
      
      if (isDuringLunch(currentTime) || 
          isDuringLunch(new Date(currentTime.getTime() + duration * 60000))) {
        setHours(currentTime, 13);
        setMinutes(currentTime, 30);
      }
      
      // Create a simple interview without using topicId in the UUID format
      dbInterviewsToCreate.push({
        audit_id: auditId,
        title: `Interview: Thématique ${topicId.replace(/theme-/g, '')}`,
        description: "Entretien sur la thématique",
        start_time: currentTime.toISOString(),
        duration_minutes: duration,
        location: "À déterminer"
      });
      
      currentTime = getNextTimeSlot(currentTime, duration);
    }
    
    // Last day - Closing meeting
    const lastDay = new Date(sortedDays[sortedDays.length - 1]);
    setHours(lastDay, 16);
    setMinutes(lastDay, 0);
    
    dbInterviewsToCreate.push({
      audit_id: auditId,
      title: "Réunion de clôture",
      description: "Présentation des conclusions préliminaires",
      start_time: lastDay.toISOString(),
      duration_minutes: 60,
      location: "Salle de réunion principale"
    });
    
    // Insert all interviews at once
    if (dbInterviewsToCreate.length > 0) {
      const insertResult = await createInterviewsInDB(dbInterviewsToCreate);
      if (insertResult) {
        return true;
      }
    } else {
      console.error('No interviews to create');
    }
    
    return false;
  } catch (error) {
    console.error('Error generating audit plan:', error);
    return false;
  }
};

/**
 * Function to check if an audit has an existing plan
 */
export const checkAuditHasPlan = async (auditId: string): Promise<boolean> => {
  try {
    const interviews = await fetchInterviewsFromDB(auditId);
    return interviews.length > 0;
  } catch (error) {
    console.error('Error checking if audit has a plan:', error);
    return false;
  }
};
