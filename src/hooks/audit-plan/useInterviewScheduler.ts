
import { addMinutes, addDays, setHours, setMinutes, isWeekend, parseISO, eachDayOfInterval } from 'date-fns';
import { AuditInterview } from '@/types';

// Constants for meeting durations
export const OPENING_MEETING_DURATION = 60; // 60 minutes
export const CLOSING_MEETING_DURATION = 60; // 60 minutes

// System theme names
export const SYSTEM_THEME_NAMES = ['ADMIN', 'Cloture'];

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
  currentDayIndex: number
): { nextTime: Date, newDayIndex: number } => {
  let nextTime = new Date(currentTime);
  let newDayIndex = currentDayIndex;
  
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
    newDayIndex++;
    
    // If we've used all selected days, we can't schedule more
    if (newDayIndex >= sortedDays.length) {
      console.log("Not enough days to schedule all interviews");
      // Reset to first day if we run out of days (for preview purposes)
      newDayIndex = 0;
    }
    
    // Set time to 9 AM on the next day
    nextTime = new Date(sortedDays[newDayIndex]);
    setHours(nextTime, 9);
    setMinutes(nextTime, 0);
  }
  
  return { nextTime, newDayIndex };
};

/**
 * Gets all business days between start and end dates
 */
export const getBusinessDays = (startDate: string, endDate: string): string[] => {
  if (!startDate || !endDate) return [];
  
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Get all days in the range
  const days = eachDayOfInterval({ start, end });
  
  // Filter out weekends
  const businessDays = days.filter(day => !isWeekend(day));
  
  // Convert to ISO strings
  return businessDays.map(day => day.toISOString());
};

/**
 * Generate preview interviews based on selected topics, themes, days and durations
 */
export const generatePreviewInterviews = (
  selectedDays: string[],
  selectedTopicIds: string[],
  themeDurations: Record<string, number>,
  themes: any[],
  systemThemeNames: string[] = SYSTEM_THEME_NAMES,
  hasOpeningClosing: boolean = true
): Partial<AuditInterview>[] => {
  if (selectedDays.length === 0 || selectedTopicIds.length === 0) {
    return [];
  }

  try {
    // Sort selected days chronologically
    const sortedDays = [...selectedDays].sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    const interviewsToPreview: Partial<AuditInterview>[] = [];

    // Always start with an opening meeting on the first day
    if (hasOpeningClosing && sortedDays.length > 0) {
      const firstDay = new Date(sortedDays[0]);
      setHours(firstDay, 9);
      setMinutes(firstDay, 0);
      
      interviewsToPreview.push({
        title: "Réunion d'ouverture",
        description: "Présentation de l'audit et des objectifs",
        startTime: firstDay.toISOString(),
        durationMinutes: OPENING_MEETING_DURATION,
        location: "Salle de réunion principale",
      });
    }
    
    // Generate interviews for each topic/theme
    let currentDayIndex = 0;
    let currentTime = new Date(sortedDays[currentDayIndex]);
    
    // If we have an opening meeting, start after it
    if (hasOpeningClosing) {
      setHours(currentTime, 10);
      setMinutes(currentTime, 0);
    } else {
      setHours(currentTime, 9);
      setMinutes(currentTime, 0);
    }
    
    // Schedule each thematic interview
    for (const topicId of selectedTopicIds) {
      const theme = themes.find(t => t.id === topicId);
      if (!theme || systemThemeNames.includes(theme.name)) continue;
      
      // Default duration if not specified
      const duration = themeDurations[topicId] || 60;
      
      // If the current time would lead to an interview going into lunch, skip to after lunch
      if (isDuringLunch(currentTime) || 
          isDuringLunch(addMinutes(currentTime, duration))) {
        const lunchTime = new Date(currentTime);
        setHours(lunchTime, 13);
        setMinutes(lunchTime, 30);
        currentTime = lunchTime;
      }
      
      // Create the interview
      interviewsToPreview.push({
        themeId: topicId,
        title: `Interview: ${theme.name}`,
        description: `Entretien sur la thématique: ${theme.name}`,
        startTime: currentTime.toISOString(),
        durationMinutes: duration,
        location: "À déterminer",
      });
      
      // Move to the next time slot
      const nextSlot = getNextTimeSlot(currentTime, duration, sortedDays, currentDayIndex);
      currentTime = nextSlot.nextTime;
      currentDayIndex = nextSlot.newDayIndex;
    }
    
    // Add closing meeting on the last day if applicable
    if (hasOpeningClosing && sortedDays.length > 0) {
      const lastDay = new Date(sortedDays[sortedDays.length - 1]);
      setHours(lastDay, 16);
      setMinutes(lastDay, 0);
      
      interviewsToPreview.push({
        title: "Réunion de clôture",
        description: "Présentation des conclusions préliminaires",
        startTime: lastDay.toISOString(),
        durationMinutes: CLOSING_MEETING_DURATION,
        location: "Salle de réunion principale",
      });
    }
    
    return interviewsToPreview;
  } catch (error) {
    console.error("Error generating preview interviews:", error);
    return [];
  }
};
