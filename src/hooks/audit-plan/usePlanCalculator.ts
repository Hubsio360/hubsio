
import { useMemo } from 'react';
import { AuditTheme } from '@/types';
import { 
  OPENING_MEETING_DURATION, 
  CLOSING_MEETING_DURATION, 
  SYSTEM_THEME_NAMES,
  BREAK_DURATION,
  LUNCH_DURATION,
  WORKING_DAY_START,
  WORKING_DAY_END
} from './useInterviewScheduler';

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
  // Calculer le total des heures d'entretien et les jours requis
  return useMemo(() => {
    // Calculer la durée totale des entretiens en minutes
    let totalMinutes = 0;
    let interviewCount = 0;
    
    // Ajouter du temps pour les réunions d'ouverture et de clôture
    if (hasOpeningClosing) {
      totalMinutes += OPENING_MEETING_DURATION + CLOSING_MEETING_DURATION;
      interviewCount += 2; // Ajouter 2 pour les réunions d'ouverture et de clôture
    }
    
    // Ajouter du temps pour chaque thématique sélectionnée (hors thématiques système)
    selectedTopicIds.forEach(topicId => {
      // Vérifier que la thématique n'est pas une thématique système
      const theme = themes.find(t => t.id === topicId);
      if (theme && !SYSTEM_THEME_NAMES.includes(theme.name)) {
        const duration = themeDurations[topicId] || 60;
        totalMinutes += duration;
        interviewCount += 1; // Un entretien par thématique
      }
    });

    // Convertir les minutes en heures
    const hours = Math.ceil(totalMinutes / 60);
    
    // Calculer les heures disponibles par jour, en tenant compte des pauses
    // Note: On ne compte pas les pauses dans la durée totale des entretiens
    // car ce sont des périodes distinctes qui n'impactent pas la durée de travail effectif
    const workdayHours = WORKING_DAY_END - WORKING_DAY_START;
    const pausesHours = (LUNCH_DURATION + (BREAK_DURATION * 2)) / 60;
    const availableHoursPerDay = Math.min(maxHoursPerDay, workdayHours - pausesHours);
    
    // Calculer les jours requis
    const days = Math.ceil(hours / availableHoursPerDay);
    
    return {
      totalHours: hours,
      totalInterviews: interviewCount,
      requiredDays: days,
      availableHoursPerDay
    };
  }, [selectedTopicIds, themeDurations, themes, hasOpeningClosing, maxHoursPerDay]);
};
