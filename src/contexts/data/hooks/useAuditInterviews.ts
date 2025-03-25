import { useState } from 'react';
import { AuditInterview, InterviewParticipant, AuditTheme } from '@/types';
import { supabase, AuditInterviewRow, selectAuditInterviews } from '@/integrations/supabase/client';
import { addMinutes, setHours, setMinutes, addDays, isAfter, isBefore } from 'date-fns';

export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRealInterviewsFromDB = async (auditId: string): Promise<AuditInterview[]> => {
    if (!auditId || !isValidUUID(auditId)) {
      console.log('Invalid audit ID provided for fetchRealInterviewsFromDB');
      return [];
    }
    
    try {
      const { data, error } = await selectAuditInterviews()
        .eq('audit_id', auditId)
        .order('start_time');
      
      if (error) {
        console.error('Error fetching real audit interviews from DB:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(interview => ({
        id: interview.id,
        auditId: interview.audit_id,
        topicId: interview.topic_id,
        themeId: interview.theme_id || undefined,
        title: interview.title,
        description: interview.description,
        startTime: interview.start_time,
        durationMinutes: interview.duration_minutes,
        location: interview.location,
        meetingLink: interview.meeting_link,
        controlRefs: interview.control_refs || undefined
      }));
    } catch (error) {
      console.error('Error in fetchRealInterviewsFromDB:', error);
      return [];
    }
  };

  const fetchInterviewsByAuditId = async (auditId: string): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      console.log('Fetching interviews for audit:', auditId); // Debug log
      
      if (!auditId || auditId.length === 0) {
        console.log('Invalid audit ID provided, returning empty array');
        setInterviews([]);
        return [];
      }
      
      try {
        if (isValidUUID(auditId)) {
          const interviews = await fetchRealInterviewsFromDB(auditId);
          
          if (interviews.length > 0) {
            console.log(`Found ${interviews.length} interviews in database`);
            setInterviews(interviews);
            return interviews;
          }
        }
        
        // If no valid interviews found in DB, return empty array
        console.log('No interviews found in database for audit:', auditId);
        setInterviews([]);
        return [];
        
      } catch (fetchError) {
        console.error('Error in fetch operation:', fetchError);
        setInterviews([]);
        return [];
      }
    } finally {
      setLoading(false);
    }
  };

  const addInterview = async (interview: Omit<AuditInterview, 'id'>): Promise<AuditInterview | null> => {
    try {
      const { data, error } = await supabase
        .from('audit_interviews')
        .insert([{
          audit_id: interview.auditId,
          topic_id: interview.topicId,
          theme_id: interview.themeId,
          title: interview.title,
          description: interview.description,
          start_time: interview.startTime,
          duration_minutes: interview.durationMinutes,
          location: interview.location,
          meeting_link: interview.meetingLink,
          control_refs: interview.controlRefs
        }])
        .select();
      
      if (error) {
        console.error('Error adding audit interview:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned after inserting interview');
        return null;
      }
      
      const insertedRecord = data[0] as AuditInterviewRow;
      
      const newInterview: AuditInterview = {
        id: insertedRecord.id,
        auditId: insertedRecord.audit_id,
        topicId: insertedRecord.topic_id,
        themeId: insertedRecord.theme_id || undefined,
        title: insertedRecord.title,
        description: insertedRecord.description,
        startTime: insertedRecord.start_time,
        durationMinutes: insertedRecord.duration_minutes,
        location: insertedRecord.location,
        meetingLink: insertedRecord.meeting_link,
        controlRefs: insertedRecord.control_refs || undefined
      };
      
      setInterviews((prev) => [...prev, newInterview]);
      return newInterview;
    } catch (error) {
      console.error('Error adding audit interview:', error);
      return null;
    }
  };

  const updateInterview = async (
    id: string,
    updates: Partial<AuditInterview>
  ): Promise<AuditInterview | null> => {
    try {
      const updateData: any = {};
      
      if (updates.auditId) updateData.audit_id = updates.auditId;
      if (updates.topicId) updateData.topic_id = updates.topicId;
      if (updates.themeId !== undefined) updateData.theme_id = updates.themeId;
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.durationMinutes) updateData.duration_minutes = updates.durationMinutes;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink;
      if (updates.controlRefs !== undefined) updateData.control_refs = updates.controlRefs;
      
      const { data, error } = await supabase
        .from('audit_interviews')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating audit interview:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned after updating interview');
        return null;
      }
      
      const updatedRecord = data[0] as AuditInterviewRow;
      
      const updatedInterview: AuditInterview = {
        id: updatedRecord.id,
        auditId: updatedRecord.audit_id,
        topicId: updatedRecord.topic_id,
        themeId: updatedRecord.theme_id || undefined,
        title: updatedRecord.title,
        description: updatedRecord.description,
        startTime: updatedRecord.start_time,
        durationMinutes: updatedRecord.duration_minutes,
        location: updatedRecord.location,
        meetingLink: updatedRecord.meeting_link,
        controlRefs: updatedRecord.control_refs || undefined
      };
      
      setInterviews((prev) =>
        prev.map((interview) => (interview.id === id ? updatedInterview : interview))
      );
      
      return updatedInterview;
    } catch (error) {
      console.error('Error updating audit interview:', error);
      return null;
    }
  };

  const deleteInterview = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_interviews')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting audit interview:', error);
        return false;
      }
      
      setInterviews((prev) => prev.filter((interview) => interview.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting audit interview:', error);
      return false;
    }
  };

  const addParticipant = async (participant: Omit<InterviewParticipant, 'notificationSent'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('interview_participants')
        .insert([{
          interview_id: participant.interviewId,
          user_id: participant.userId,
          role: participant.role,
          notification_sent: false
        }]);
      
      if (error) {
        console.error('Error adding interview participant:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding interview participant:', error);
      return false;
    }
  };

  const removeParticipant = async (interviewId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('interview_participants')
        .delete()
        .eq('interview_id', interviewId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error removing interview participant:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error removing interview participant:', error);
      return false;
    }
  };

  const getParticipantsByInterviewId = async (interviewId: string): Promise<InterviewParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from('interview_participants')
        .select('*')
        .eq('interview_id', interviewId);
      
      if (error) {
        console.error('Error getting participants by interview ID:', error);
        return [];
      }
      
      return data.map(p => ({
        interviewId: p.interview_id,
        userId: p.user_id,
        role: p.role,
        notificationSent: p.notification_sent
      }));
    } catch (error) {
      console.error('Error getting participants by interview ID:', error);
      return [];
    }
  };

  const generateAuditPlan = async (
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
      try {
        console.log(`Deleting existing interviews for audit: ${auditId}`);
        
        const { error: deleteError } = await supabase
          .from('audit_interviews')
          .delete()
          .eq('audit_id', auditId);
        
        if (deleteError) {
          console.error("Error deleting existing interviews:", deleteError);
          return false;
        } else {
          console.log("Successfully deleted existing interviews");
        }
      } catch (deleteError) {
        console.error('Error during deletion of existing interviews:', deleteError);
        return false;
      }
      
      // Sort selected days chronologically
      const sortedDays = [...selectedDays].sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      // Create database-ready interview objects
      const dbInterviewsToCreate: any[] = [];
      
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
      
      const isDuringLunch = (time: Date): boolean => {
        const hour = time.getHours();
        const minute = time.getMinutes();
        return (hour === 12) || (hour === 13 && minute < 30);
      };
      
      const getNextTimeSlot = (currentTime: Date, durationMinutes: number): Date => {
        let nextTime = new Date(currentTime);
        nextTime = addMinutes(nextTime, durationMinutes);
        
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
            isDuringLunch(addMinutes(currentTime, duration))) {
          setHours(currentTime, 13);
          setMinutes(currentTime, 30);
        }
        
        dbInterviewsToCreate.push({
          audit_id: auditId,
          topic_id: topicId,
          theme_id: topicId,
          title: `Interview: ${topicId}`,
          description: `Entretien sur la thématique`,
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
        console.log(`Inserting ${dbInterviewsToCreate.length} interviews into database`);
        
        const { data, error: insertError } = await supabase
          .from('audit_interviews')
          .insert(dbInterviewsToCreate)
          .select();
          
        if (insertError) {
          console.error('Error creating audit interviews in DB:', insertError);
          return false;
        } else {
          console.log(`Successfully inserted ${data?.length || 0} interviews into DB`);
          
          // After successful DB creation, refresh the interviews state
          const newInterviews = await fetchRealInterviewsFromDB(auditId);
          setInterviews(newInterviews);
          
          return true;
        }
      } else {
        console.error('No interviews to create');
        return false;
      }
    } catch (error) {
      console.error('Error generating audit plan:', error);
      return false;
    }
  };

  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  return {
    interviews,
    loading,
    fetchInterviewsByAuditId,
    fetchRealInterviewsFromDB,
    addInterview,
    updateInterview,
    deleteInterview,
    addParticipant,
    removeParticipant,
    getParticipantsByInterviewId,
    generateAuditPlan
  };
};
