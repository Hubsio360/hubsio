
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { getBusinessDays, SYSTEM_THEME_NAMES } from './useInterviewScheduler';
import { parseISO } from 'date-fns';
import { AuditPlanState } from './types';

export const useAuditPlanData = (
  auditId: string,
  startDate: string,
  endDate: string
) => {
  const { fetchInterviewsByAuditId, fetchThemes, fetchTopics, themes } = useData();
  const { toast } = useToast();
  
  const [state, setState] = useState<AuditPlanState>({
    selectedTopicIds: [],
    selectedDays: [],
    themeDurations: {},
    generating: false,
    interviews: 0,
    existingInterviews: 0,
    existingThemes: 0,
    initialLoad: false,
    maxHoursPerDay: 8,
    previewInterviews: [],
    hasOpeningClosing: true
  });

  // Initialize selected days based on date range
  useEffect(() => {
    if (startDate && endDate && !state.initialLoad) {
      const businessDays = getBusinessDays(startDate, endDate);
      setState(prev => ({ ...prev, selectedDays: businessDays }));
    }
  }, [startDate, endDate, state.initialLoad]);

  // Load existing data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      if (!auditId || state.initialLoad) return;
      
      try {
        const existingInterviewsData = await fetchInterviewsByAuditId(auditId);
        
        const uniqueThemes = new Set(
          existingInterviewsData
            .filter(interview => {
              const theme = themes.find(t => t.id === interview.themeId);
              return theme && !SYSTEM_THEME_NAMES.includes(theme.name);
            })
            .map(interview => interview.themeId)
            .filter(Boolean)
        );
        
        await fetchThemes();
        await fetchTopics();

        const initialThemeDurations: Record<string, number> = {};
        themes.forEach(theme => {
          initialThemeDurations[theme.id] = 60;
        });
        
        setState(prev => ({
          ...prev,
          existingInterviews: existingInterviewsData.length,
          existingThemes: uniqueThemes.size,
          themeDurations: initialThemeDurations,
          initialLoad: true
        }));
      } catch (error) {
        console.error("Error loading existing audit data:", error);
      }
    };
    
    loadExistingData();
  }, [auditId, fetchInterviewsByAuditId, fetchThemes, fetchTopics, state.initialLoad, themes]);

  // Validate selected days against date range
  useEffect(() => {
    if (startDate && endDate && state.selectedDays.length > 0 && state.initialLoad) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      const validDays = state.selectedDays.filter(day => {
        const date = new Date(day);
        return date >= start && date <= end;
      });
      
      if (validDays.length !== state.selectedDays.length) {
        setState(prev => ({ ...prev, selectedDays: validDays }));
      }
    }
  }, [startDate, endDate, state.selectedDays, state.initialLoad]);

  return {
    state,
    setState
  };
};
