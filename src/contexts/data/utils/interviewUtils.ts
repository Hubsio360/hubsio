
import { AuditInterview } from '@/types';
import { addMinutes, setHours, setMinutes, addDays, isAfter, isBefore } from 'date-fns';
import { InterviewInsert } from './interviewDbOps';

/**
 * Checks if a given string is a valid UUID
 */
export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Checks if a given time is during lunch break (12:00-13:30)
 */
export const isDuringLunch = (time: Date): boolean => {
  const hour = time.getHours();
  const minute = time.getMinutes();
  return (hour === 12) || (hour === 13 && minute < 30);
};

/**
 * Gets the next available time slot based on current time and duration
 */
export const getNextTimeSlot = (
  currentTime: Date, 
  durationMinutes: number, 
  sortedDays: string[], 
  currentDay: number
): { nextTime: Date, newDay: number } => {
  let nextTime = new Date(currentTime);
  let newDay = currentDay;
  
  // Add the interview duration
  nextTime = addMinutes(nextTime, durationMinutes);
  
  // If we're now in the lunch break, move to after lunch
  if (isDuringLunch(nextTime) || (isDuringLunch(currentTime) && isDuringLunch(nextTime))) {
    nextTime = new Date(nextTime);
    setHours(nextTime, 13);
    setMinutes(nextTime, 30);
  }
  
  // If we've gone past the end of the day (5 PM), move to the next day
  if (nextTime.getHours() >= 17) {
    newDay++;
    
    // If we've used all selected days, we can't schedule more
    if (newDay >= sortedDays.length) {
      console.log("Not enough days to schedule all interviews");
      // Reset to first day if we run out of days (for preview purposes)
      newDay = 0;
    }
    
    // Set time to 9 AM on the next day
    nextTime = new Date(sortedDays[newDay]);
    setHours(nextTime, 9);
    setMinutes(nextTime, 0);
  }
  
  return { nextTime, newDay };
};

/**
 * Format an interview for database insertion
 */
export const formatInterviewForDB = (
  interview: Partial<AuditInterview>
): InterviewInsert => {
  return {
    audit_id: interview.auditId || '',
    topic_id: interview.topicId,
    theme_id: interview.themeId,
    title: interview.title || '',
    description: interview.description,
    start_time: interview.startTime || new Date().toISOString(),
    duration_minutes: interview.durationMinutes || 60,
    location: interview.location,
    meeting_link: interview.meetingLink,
    control_refs: interview.controlRefs
  };
};

/**
 * Validate interview data before database operations
 */
export const validateInterview = (interview: Partial<AuditInterview>): boolean => {
  if (!interview.title || !interview.startTime || !interview.durationMinutes || !interview.auditId) {
    console.error('Interview validation failed: Missing required fields');
    return false;
  }
  return true;
};
