
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { AuditTheme, AuditInterview } from '@/types';
import { parseISO } from 'date-fns';
import { usePlanCalculator } from './audit-plan/usePlanCalculator';
import { 
  generatePreviewInterviews, 
  getBusinessDays,
  SYSTEM_THEME_NAMES
} from './audit-plan/useInterviewScheduler';

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

  const [previewInterviews, setPreviewInterviews] = useState<Partial<AuditInterview>[]>([]);
  
  // Always include opening and closing meetings
  const hasOpeningClosing = true;

  // Initialize the selected days with business days from the audit date range
  useEffect(() => {
    if (startDate && endDate && !initialLoad) {
      const businessDays = getBusinessDays(startDate, endDate);
      setSelectedDays(businessDays);
    }
  }, [startDate, endDate, initialLoad]);

  // Load existing data for this audit
  useEffect(() => {
    const loadExistingData = async () => {
      if (!auditId || initialLoad) return;
      
      try {
        // Load existing interviews for this audit
        const existingInterviewsData = await fetchInterviewsByAuditId(auditId);
        setExistingInterviews(existingInterviewsData.length);
        
        // Calculate unique themes from existing interviews (excluding system themes)
        const uniqueThemes = new Set(
          existingInterviewsData
            .filter(interview => {
              const theme = themes.find(t => t.id === interview.themeId);
              return theme && !SYSTEM_THEME_NAMES.includes(theme.name);
            })
            .map(interview => interview.themeId)
            .filter(Boolean)
        );
        
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

  // Reset selected days when audit dates change 
  useEffect(() => {
    if (startDate && endDate && selectedDays.length > 0 && initialLoad) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      // Filter out days that are now outside the range
      const validDays = selectedDays.filter(day => {
        const date = new Date(day);
        return date >= start && date <= end;
      });
      
      // Only update if we actually removed days
      if (validDays.length !== selectedDays.length) {
        setSelectedDays(validDays);
      }
    }
  }, [startDate, endDate, selectedDays, initialLoad]);

  // Calculate total interview hours and required days using the utility hook
  const {
    totalHours,
    totalInterviews,
    requiredDays,
    availableHoursPerDay
  } = usePlanCalculator({
    selectedTopicIds,
    themeDurations,
    themes,
    hasOpeningClosing,
    maxHoursPerDay
  });

  // Generate preview interviews whenever selected days or topics change
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
  }, [selectedDays, selectedTopicIds, themeDurations, hasOpeningClosing, themes]);

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
      console.log("Starting audit plan generation with data:", {
        auditId,
        startDate,
        endDate,
        topicIds: selectedTopicIds,
        selectedDays,
        themeDurations
      });
      
      // Generate the audit plan with correct arguments
      const success = await generateAuditPlan(auditId, startDate, endDate, {
        topicIds: selectedTopicIds,
        selectedDays: selectedDays,
        themeDurations: themeDurations,
        maxHoursPerDay: maxHoursPerDay
      });

      if (success) {
        toast({
          title: "Plan d'audit généré",
          description: "Le plan d'audit a été généré avec succès et enregistré en base de données",
        });

        // Notify parent component about successful generation
        if (onPlanGenerated) {
          onPlanGenerated('calendar');
        }
      } else {
        throw new Error("La génération du plan n'a pas abouti");
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
    systemThemeNames: SYSTEM_THEME_NAMES,
    handleThemeDurationChange,
    generatePlan,
    availableHoursPerDay,
    previewInterviews
  };
};
