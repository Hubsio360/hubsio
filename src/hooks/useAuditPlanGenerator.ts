
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { AuditTheme } from '@/types';

interface UseAuditPlanGeneratorProps {
  auditId: string;
  startDate: string;
  endDate: string;
  onPlanGenerated?: (targetTab?: string) => void;
}

export const useAuditPlanGenerator = ({
  auditId,
  startDate,
  endDate,
  onPlanGenerated
}: UseAuditPlanGeneratorProps) => {
  const { 
    fetchTopics,
    fetchThemes,
    themes,
    fetchInterviewsByAuditId,
    generateAuditPlan
  } = useData();
  const { toast } = useToast();

  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [themeDurations, setThemeDurations] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);
  const [interviews, setInterviews] = useState<number>(0);
  const [existingInterviews, setExistingInterviews] = useState<number>(0);
  const [existingThemes, setExistingThemes] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState(false);
  const [maxHoursPerDay] = useState(8); // 8 hours per day maximum

  // Default durations for opening and closing meetings
  const OPENING_MEETING_DURATION = 60; // 60 minutes
  const CLOSING_MEETING_DURATION = 60; // 60 minutes
  
  // Always include opening and closing meetings
  const hasOpeningClosing = true;

  // Load existing data for this audit
  useEffect(() => {
    const loadExistingData = async () => {
      if (!auditId || initialLoad) return;
      
      try {
        // Load existing interviews for this audit
        const existingInterviewsData = await fetchInterviewsByAuditId(auditId);
        setExistingInterviews(existingInterviewsData.length);
        
        // Calculate unique themes from existing interviews
        const uniqueThemes = new Set(existingInterviewsData.map(interview => interview.themeId).filter(Boolean));
        setExistingThemes(uniqueThemes.size);
        
        // Load available themes
        await fetchThemes();
        await fetchTopics();

        // Initialize theme durations with defaults
        const initialThemeDurations: Record<string, number> = {};
        themes.forEach(theme => {
          initialThemeDurations[theme.id] = 60; // Default 60 minutes
        });
        setThemeDurations(initialThemeDurations);
        
        setInitialLoad(true);
      } catch (error) {
        console.error("Error loading existing audit data:", error);
      }
    };
    
    loadExistingData();
  }, [auditId, fetchInterviewsByAuditId, fetchThemes, fetchTopics, initialLoad, themes]);

  // Calculate total interview hours and required days
  const {
    totalHours,
    totalInterviews,
    requiredDays
  } = useMemo(() => {
    // Calculate the total interview time in minutes
    let totalMinutes = 0;
    let interviewCount = 0;
    
    // Add time for opening and closing meetings
    if (hasOpeningClosing) {
      totalMinutes += OPENING_MEETING_DURATION + CLOSING_MEETING_DURATION;
      interviewCount += 2;
    }
    
    // Add time for each selected topic/theme
    selectedTopicIds.forEach(topicId => {
      // Find all themes related to this topic
      const relatedThemeIds = themes
        .filter(theme => theme.id === topicId) // For now, assuming topic IDs match theme IDs
        .map(theme => theme.id);
      
      relatedThemeIds.forEach(themeId => {
        if (themeId) {
          const duration = themeDurations[themeId] || 60;
          totalMinutes += duration;
          interviewCount += 1;
        }
      });
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

  // Handle duration change for a specific theme
  const handleThemeDurationChange = (themeId: string, duration: number) => {
    setThemeDurations(prev => ({
      ...prev,
      [themeId]: duration
    }));
  };

  const generatePlan = async () => {
    if (!auditId) {
      toast({
        title: "Erreur",
        description: "ID d'audit manquant",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopicIds.length === 0) {
      toast({
        title: "Thématiques requises",
        description: "Veuillez sélectionner au moins une thématique",
        variant: "destructive",
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Jours requis",
        description: "Veuillez sélectionner au moins un jour pour les interviews",
        variant: "destructive",
      });
      return;
    }

    // Check if we have enough days selected
    if (selectedDays.length < requiredDays) {
      toast({
        title: "Jours insuffisants",
        description: `Vous avez besoin d'au moins ${requiredDays} jours pour couvrir toutes les thématiques sélectionnées`,
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Generate the audit plan with correct arguments
      await generateAuditPlan(auditId, startDate, endDate, {
        topicIds: selectedTopicIds,
        selectedDays: selectedDays,
        themeDurations: themeDurations,
        maxHoursPerDay: maxHoursPerDay
      });

      toast({
        title: "Plan d'audit généré",
        description: "Le plan d'audit a été généré avec succès",
      });

      // Notify parent component about successful generation
      if (onPlanGenerated) {
        onPlanGenerated('calendar');
      }
    } catch (error) {
      console.error("Error generating audit plan:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le plan d'audit",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return {
    selectedTopicIds,
    setSelectedTopicIds,
    selectedDays,
    setSelectedDays,
    themeDurations,
    generating,
    interviews,
    existingInterviews,
    existingThemes,
    maxHoursPerDay,
    totalHours,
    totalInterviews,
    requiredDays,
    hasOpeningClosing,
    themes,
    handleThemeDurationChange,
    generatePlan
  };
};
