
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { AuditTheme } from '@/types';
import { UseAuditPlanGeneratorProps } from './audit-plan/types';
import { useAuditPlanData } from './audit-plan/useAuditPlanData';
import { usePlanCalculator } from './audit-plan/usePlanCalculator';
import { usePreviewInterviews } from './audit-plan/usePreviewInterviews';
import { usePlanGeneration } from './audit-plan/usePlanGeneration';
import { SYSTEM_THEME_NAMES } from './audit-plan/useInterviewScheduler';

export const useAuditPlanGenerator = ({
  auditId,
  frameworkId,
  startDate,
  endDate,
  onPlanGenerated
}: UseAuditPlanGeneratorProps) => {
  const { themes, fetchThemes } = useData();
  const { state, setState } = useAuditPlanData(auditId, startDate, endDate);
  const [previewInterviews, setPreviewInterviews] = useState<Partial<any>[]>([]);
  
  // S'assurer que nous avons des thématiques
  useEffect(() => {
    const ensureThemes = async () => {
      if (themes.length === 0) {
        console.log("Pas de thématiques chargées, tentative de chargement");
        try {
          await fetchThemes();
        } catch (error) {
          console.error("Erreur lors du chargement des thématiques:", error);
        }
      }
    };
    
    ensureThemes();
  }, [themes, fetchThemes]);
  
  const {
    totalHours,
    totalInterviews,
    requiredDays,
    availableHoursPerDay
  } = usePlanCalculator({
    selectedTopicIds: state.selectedTopicIds,
    themeDurations: state.themeDurations,
    themes,
    hasOpeningClosing: state.hasOpeningClosing,
    maxHoursPerDay: state.maxHoursPerDay
  });

  // Use the preview interviews hook
  usePreviewInterviews(
    state.selectedDays,
    state.selectedTopicIds,
    state.themeDurations,
    themes,
    state.hasOpeningClosing,
    setPreviewInterviews
  );

  // Use the plan generation hook
  const { generating, generatePlan } = usePlanGeneration(auditId, startDate, endDate, onPlanGenerated);

  const handleThemeDurationChange = (themeId: string, duration: number) => {
    setState(prev => ({
      ...prev,
      themeDurations: {
        ...prev.themeDurations,
        [themeId]: duration
      }
    }));
  };

  const handleGeneratePlan = () => {
    generatePlan({
      selectedTopicIds: state.selectedTopicIds,
      selectedDays: state.selectedDays,
      themeDurations: state.themeDurations,
      maxHoursPerDay: state.maxHoursPerDay,
      requiredDays
    });
  };

  return {
    selectedTopicIds: state.selectedTopicIds,
    setSelectedTopicIds: (topicIds: string[]) => 
      setState(prev => ({ ...prev, selectedTopicIds: topicIds })),
    selectedDays: state.selectedDays,
    setSelectedDays: (days: string[]) => 
      setState(prev => ({ ...prev, selectedDays: days })),
    themeDurations: state.themeDurations,
    generating,
    interviews: state.interviews,
    existingInterviews: state.existingInterviews,
    existingThemes: state.existingThemes,
    maxHoursPerDay: state.maxHoursPerDay,
    totalHours,
    totalInterviews,
    requiredDays,
    hasOpeningClosing: state.hasOpeningClosing,
    themes,
    systemThemeNames: SYSTEM_THEME_NAMES,
    handleThemeDurationChange,
    generatePlan: handleGeneratePlan,
    availableHoursPerDay,
    previewInterviews,
    frameworkId
  };
};
