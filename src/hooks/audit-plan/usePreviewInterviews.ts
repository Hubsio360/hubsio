
import { useEffect } from 'react';
import { generatePreviewInterviews, SYSTEM_THEME_NAMES } from './useInterviewScheduler';
import { AuditTheme } from '@/types';

export const usePreviewInterviews = (
  selectedDays: string[],
  selectedTopicIds: string[],
  themeDurations: Record<string, number>,
  themes: AuditTheme[],
  hasOpeningClosing: boolean,
  setPreviewInterviews: (interviews: any[]) => void
) => {
  useEffect(() => {
    const interviews = generatePreviewInterviews(
      selectedDays,
      selectedTopicIds,
      themeDurations,
      themes,
      SYSTEM_THEME_NAMES,
      hasOpeningClosing
    );
    
    setPreviewInterviews(interviews);
  }, [selectedDays, selectedTopicIds, themeDurations, hasOpeningClosing, themes, setPreviewInterviews]);
};
