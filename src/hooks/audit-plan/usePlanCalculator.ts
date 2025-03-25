
import { useMemo } from 'react';
import { AuditTheme } from '@/types';
import { OPENING_MEETING_DURATION, CLOSING_MEETING_DURATION, SYSTEM_THEME_NAMES } from './useInterviewScheduler';

interface UsePlanCalculatorProps {
  selectedTopicIds: string[];
  themeDurations: Record<string, number>;
  themes: AuditTheme[];
  hasOpeningClosing: boolean;
  maxHoursPerDay: number;
}

export const usePlanCalculator = ({
  selectedTopicIds,
  themeDurations,
  themes,
  hasOpeningClosing,
  maxHoursPerDay
}: UsePlanCalculatorProps) => {
  // Calculate total interview hours and required days
  return useMemo(() => {
    // Calculate the total interview time in minutes
    let totalMinutes = 0;
    let interviewCount = 0;
    
    // Add time for opening and closing meetings
    if (hasOpeningClosing) {
      totalMinutes += OPENING_MEETING_DURATION + CLOSING_MEETING_DURATION;
      interviewCount += 2; // Add 2 for opening and closing meetings
    }
    
    // Add time for each selected topic/theme (excluding system themes)
    selectedTopicIds.forEach(topicId => {
      // Check that the theme is not a system theme
      const theme = themes.find(t => t.id === topicId);
      if (theme && !SYSTEM_THEME_NAMES.includes(theme.name)) {
        const duration = themeDurations[topicId] || 60;
        totalMinutes += duration;
        interviewCount += 1; // One interview per theme
      }
    });

    // Convert minutes to hours
    const hours = Math.ceil(totalMinutes / 60);
    
    // Calculate available hours per day, accounting for lunch break
    const availableHoursPerDay = maxHoursPerDay - 1.5; // 8 hour day minus 1.5 hour lunch break
    
    // Calculate required days
    const days = Math.ceil(hours / availableHoursPerDay);
    
    return {
      totalHours: hours,
      totalInterviews: interviewCount,
      requiredDays: days,
      availableHoursPerDay
    };
  }, [selectedTopicIds, themeDurations, themes, hasOpeningClosing, maxHoursPerDay]);
};
