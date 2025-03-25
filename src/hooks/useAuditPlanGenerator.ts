
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { AuditTheme, AuditInterview } from '@/types';
import { parseISO, setHours, setMinutes, addMinutes, addDays, format, eachDayOfInterval, isWeekend } from 'date-fns';

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

  // Les thèmes systèmes pour les réunions d'ouverture et de clôture
  const SYSTEM_THEME_NAMES = ['ADMIN', 'Cloture'];

  // Default durations for opening and closing meetings
  const OPENING_MEETING_DURATION = 60; // 60 minutes
  const CLOSING_MEETING_DURATION = 60; // 60 minutes
  
  // Always include opening and closing meetings
  const hasOpeningClosing = true;

  // Initialize the selected days with business days from the audit date range
  useEffect(() => {
    if (startDate && endDate && !initialLoad) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      // Get all days in the range
      const days = eachDayOfInterval({ start, end });
      
      // Filter out weekends
      const businessDays = days.filter(day => !isWeekend(day));
      
      // Convert to ISO strings
      const businessDaysIso = businessDays.map(day => day.toISOString());
      
      // Set as selected days
      setSelectedDays(businessDaysIso);
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

  // Calculate total interview hours and required days
  const {
    totalHours,
    totalInterviews,
    requiredDays,
    availableHoursPerDay
  } = useMemo(() => {
    // Calculate the total interview time in minutes
    let totalMinutes = 0;
    let interviewCount = 0;
    
    // Add time for opening and closing meetings
    if (hasOpeningClosing) {
      totalMinutes += OPENING_MEETING_DURATION + CLOSING_MEETING_DURATION;
      interviewCount += 2; // Ajouter 2 pour les réunions d'ouverture et de clôture
    }
    
    // Add time for each selected topic/theme (excluding system themes)
    selectedTopicIds.forEach(topicId => {
      // Vérifier que le thème n'est pas un thème système
      const theme = themes.find(t => t.id === topicId);
      if (theme && !SYSTEM_THEME_NAMES.includes(theme.name)) {
        const duration = themeDurations[topicId] || 60;
        totalMinutes += duration;
        interviewCount += 1; // Une interview par thématique
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
  }, [selectedTopicIds, themeDurations, themes, hasOpeningClosing, maxHoursPerDay, SYSTEM_THEME_NAMES]);

  // Generate preview interviews whenever selected days or topics change
  useEffect(() => {
    if (selectedDays.length === 0 || selectedTopicIds.length === 0) {
      setPreviewInterviews([]);
      return;
    }

    try {
      // Sort selected days chronologically
      const sortedDays = [...selectedDays].sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      const interviewsToPreview: Partial<AuditInterview>[] = [];

      // Function to check if time is during lunch break (12:00-13:30)
      const isDuringLunch = (time: Date): boolean => {
        const hour = time.getHours();
        const minute = time.getMinutes();
        return (hour === 12) || (hour === 13 && minute < 30);
      };
      
      // Always start with an opening meeting on the first day
      if (hasOpeningClosing && sortedDays.length > 0) {
        const firstDay = new Date(sortedDays[0]);
        setHours(firstDay, 9);
        setMinutes(firstDay, 0);
        
        interviewsToPreview.push({
          title: "Réunion d'ouverture",
          description: "Présentation de l'audit et des objectifs",
          startTime: firstDay.toISOString(),
          durationMinutes: 60,
          location: "Salle de réunion principale",
        });
      }
      
      // Function to get next available time slot
      const getNextTimeSlot = (currentTime: Date, durationMinutes: number): Date => {
        // Start with the current time
        let nextTime = new Date(currentTime);
        
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
          currentDayIndex++;
          
          // If we've used all selected days, we can't schedule more
          if (currentDayIndex >= sortedDays.length) {
            console.log("Preview: Not enough days to schedule all interviews");
            // Reset to first day if we run out of days (for preview purposes)
            currentDayIndex = 0;
          }
          
          // Set time to 9 AM on the next day
          nextTime = new Date(sortedDays[currentDayIndex]);
          setHours(nextTime, 9);
          setMinutes(nextTime, 0);
        }
        
        return nextTime;
      };

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
        if (!theme || SYSTEM_THEME_NAMES.includes(theme.name)) continue;
        
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
        currentTime = getNextTimeSlot(currentTime, duration);
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
          durationMinutes: 60,
          location: "Salle de réunion principale",
        });
      }
      
      setPreviewInterviews(interviewsToPreview);
    } catch (error) {
      console.error("Error generating preview interviews:", error);
      setPreviewInterviews([]);
    }
  }, [selectedDays, selectedTopicIds, themeDurations, hasOpeningClosing, themes, SYSTEM_THEME_NAMES]);

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
