
import { useState, useEffect } from 'react';
import { AuditPlanState } from './types';
import { useData } from '@/contexts/DataContext';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const useAuditPlanData = (auditId: string, startDate: string, endDate: string) => {
  const [state, setState] = useState<AuditPlanState>({
    selectedTopicIds: [],
    selectedDays: [],
    themeDurations: {},
    generating: false,
    interviews: 0,
    existingInterviews: 0,
    existingThemes: 0,
    initialLoad: false,
    maxHoursPerDay: 6,
    previewInterviews: [],
    hasOpeningClosing: true,
  });

  const { themes, fetchThemes } = useData();

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        console.log("useAuditPlanData - Loading initial data for audit:", auditId);
        
        // Chargement des thématiques
        const themeData = await fetchThemes();
        console.log("useAuditPlanData - Themes loaded:", themeData);
        
        // Par défaut, sélectionner toutes les thématiques disponibles
        // (sauf celles destinées à l'administration comme ADMIN et Cloture)
        const allThemeIds = themeData
          .filter(theme => !['ADMIN', 'Cloture'].includes(theme.name))
          .map(theme => theme.id);
        
        // Initialiser les durées par défaut (60 minutes par thématique)
        const defaultDurations: Record<string, number> = {};
        themeData.forEach(theme => {
          defaultDurations[theme.id] = 60; // 60 minutes par défaut
        });

        // Générer les jours disponibles
        const daysArray = generateAvailableDays(startDate, endDate);
        
        // Vérifier les entretiens existants
        const { data: existingInterviews } = await supabase
          .from('audit_interviews')
          .select('*')
          .eq('audit_id', auditId);
          
        const existingCount = existingInterviews?.length || 0;
        
        // Compter les thématiques existantes (basé sur les theme_id uniques)
        const existingThemeIds = new Set<string>();
        existingInterviews?.forEach(interview => {
          if (interview.theme_id) {
            existingThemeIds.add(interview.theme_id);
          }
        });
        
        setState(prev => ({
          ...prev,
          selectedTopicIds: allThemeIds, // Toutes les thématiques sélectionnées par défaut
          themeDurations: defaultDurations,
          selectedDays: daysArray,
          interviews: existingCount + allThemeIds.length + 2, // +2 pour réunions d'ouverture/clôture
          existingInterviews: existingCount,
          existingThemes: existingThemeIds.size,
          initialLoad: true
        }));
        
        console.log("useAuditPlanData - Initial state set with themes:", allThemeIds.length);
      } catch (error) {
        console.error("Error loading initial audit plan data:", error);
        // En cas d'erreur, on initialise quand même avec les thématiques vides
        // mais on marque l'initialisation comme complète
        setState(prev => ({
          ...prev,
          initialLoad: true
        }));
      }
    };

    if (!state.initialLoad) {
      loadPlanData();
    }
  }, [auditId, startDate, endDate, fetchThemes, state.initialLoad]);

  return { state, setState };
};

// Fonction pour générer les jours disponibles pour l'audit
const generateAvailableDays = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];
  
  const totalDays = differenceInCalendarDays(end, start) + 1;
  for (let i = 0; i < totalDays; i++) {
    const currentDay = addDays(start, i);
    const dayOfWeek = currentDay.getDay();
    
    // Exclure les week-ends (0 = dimanche, 6 = samedi)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(format(currentDay, 'yyyy-MM-dd'));
    }
  }
  
  return days;
};
