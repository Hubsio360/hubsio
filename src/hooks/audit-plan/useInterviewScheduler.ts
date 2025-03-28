
import { addMinutes, addDays, setHours, setMinutes, isWeekend, parseISO, eachDayOfInterval, isBefore, isAfter } from 'date-fns';
import { AuditInterview } from '@/types';

// Constantes pour les horaires et pauses
export const WORKING_DAY_START = 9; // 9h00
export const MORNING_BREAK_TIME = 10; // 10h00
export const LUNCH_BREAK_START = 12; // 12h00
export const LUNCH_BREAK_END = 13; // 13h00
export const AFTERNOON_BREAK_TIME = 16; // 16h00
export const WORKING_DAY_END = 18; // 18h00
export const BREAK_DURATION = 15; // 15 minutes
export const LUNCH_DURATION = 60; // 60 minutes

// Constantes pour les durées des réunions
export const OPENING_MEETING_DURATION = 60; // 60 minutes
export const CLOSING_MEETING_DURATION = 60; // 60 minutes

// Noms des thématiques système
export const SYSTEM_THEME_NAMES = ['ADMIN', 'Cloture'];

/**
 * Vérifie si un horaire est pendant la pause déjeuner (12h-13h)
 */
export const isDuringLunch = (time: Date): boolean => {
  const hour = time.getHours();
  return hour >= LUNCH_BREAK_START && hour < LUNCH_BREAK_END;
};

/**
 * Vérifie si un horaire est pendant une pause café (10h ou 16h)
 */
export const isDuringBreak = (time: Date): boolean => {
  const hour = time.getHours();
  const minute = time.getMinutes();
  return (hour === MORNING_BREAK_TIME && minute < BREAK_DURATION) || 
         (hour === AFTERNOON_BREAK_TIME && minute < BREAK_DURATION);
};

/**
 * Vérifie si un horaire est en dehors des heures de travail
 */
export const isOutsideWorkingHours = (time: Date): boolean => {
  const hour = time.getHours();
  return hour < WORKING_DAY_START || hour >= WORKING_DAY_END;
};

/**
 * Trouve le prochain créneau horaire disponible
 */
export const getNextTimeSlot = (
  currentTime: Date, 
  durationMinutes: number, 
  sortedDays: string[], 
  currentDayIndex: number,
  minutesScheduledToday: number,
  idealMinutesPerDay: number
): { nextTime: Date, newDayIndex: number, newMinutesScheduled: number } => {
  let nextTime = new Date(currentTime);
  let newDayIndex = currentDayIndex;
  let newMinutesScheduled = minutesScheduledToday;
  
  // S'assurer que nous commençons pas avant les heures de bureau
  if (nextTime.getHours() < WORKING_DAY_START) {
    setHours(nextTime, WORKING_DAY_START);
    setMinutes(nextTime, 0);
  }
  
  // Ajouter la durée de l'entretien
  nextTime = addMinutes(nextTime, durationMinutes);
  newMinutesScheduled += durationMinutes;
  
  // Si nous sommes maintenant dans la pause de 10h
  if (nextTime.getHours() === MORNING_BREAK_TIME && nextTime.getMinutes() < BREAK_DURATION) {
    nextTime = new Date(nextTime);
    setHours(nextTime, MORNING_BREAK_TIME);
    setMinutes(nextTime, BREAK_DURATION);
  }
  
  // Si nous sommes maintenant dans la pause déjeuner ou si l'entretien chevauche la pause déjeuner
  if (isDuringLunch(nextTime) || (currentTime.getHours() < LUNCH_BREAK_START && nextTime.getHours() >= LUNCH_BREAK_START)) {
    nextTime = new Date(currentTime);
    setHours(nextTime, LUNCH_BREAK_END);
    setMinutes(nextTime, 0);
    // Ajuster le temps alloué pour tenir compte de la pause déjeuner
    if (currentTime.getHours() < LUNCH_BREAK_START) {
      const timeBeforeLunch = (LUNCH_BREAK_START - currentTime.getHours()) * 60 - currentTime.getMinutes();
      newMinutesScheduled = timeBeforeLunch;
    }
  }
  
  // Si nous sommes maintenant dans la pause de 16h
  if (nextTime.getHours() === AFTERNOON_BREAK_TIME && nextTime.getMinutes() < BREAK_DURATION) {
    nextTime = new Date(nextTime);
    setHours(nextTime, AFTERNOON_BREAK_TIME);
    setMinutes(nextTime, BREAK_DURATION);
  }
  
  // Si nous avons dépassé la limite idéale de minutes par jour ou si nous sommes en fin de journée
  if ((newMinutesScheduled > idealMinutesPerDay && newDayIndex < sortedDays.length - 1) || 
      nextTime.getHours() >= WORKING_DAY_END || 
      (nextTime.getHours() === WORKING_DAY_END - 1 && nextTime.getMinutes() > 0)) {
    newDayIndex++;
    
    // Si nous avons utilisé tous les jours sélectionnés
    if (newDayIndex >= sortedDays.length) {
      console.log("Pas assez de jours pour planifier tous les entretiens");
      // Revenir au premier jour pour la prévisualisation
      newDayIndex = 0;
    }
    
    // Définir l'heure à 9h le jour suivant
    nextTime = new Date(sortedDays[newDayIndex]);
    setHours(nextTime, WORKING_DAY_START);
    setMinutes(nextTime, 0);
    newMinutesScheduled = 0;
  }
  
  return { nextTime, newDayIndex, newMinutesScheduled };
};

/**
 * Récupère tous les jours ouvrables entre les dates de début et de fin
 */
export const getBusinessDays = (startDate: string, endDate: string): string[] => {
  if (!startDate || !endDate) return [];
  
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Récupérer tous les jours dans la plage
  const days = eachDayOfInterval({ start, end });
  
  // Filtrer les week-ends
  const businessDays = days.filter(day => !isWeekend(day));
  
  // Convertir en chaînes ISO
  return businessDays.map(day => day.toISOString());
};

/**
 * Génère une prévisualisation des entretiens basée sur les paramètres sélectionnés
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
    // Trier les jours sélectionnés chronologiquement
    const sortedDays = [...selectedDays].sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    const interviewsToPreview: Partial<AuditInterview>[] = [];

    // Calculer la durée totale des thématiques
    let totalThematicDuration = 0;
    let thematicCount = 0;
    
    selectedTopicIds.forEach(topicId => {
      const theme = themes.find(t => t.id === topicId);
      if (theme && !systemThemeNames.includes(theme.name)) {
        totalThematicDuration += themeDurations[topicId] || 60;
        thematicCount++;
      }
    });
    
    // Calculer la répartition idéale par jour
    const effectiveMinutesPerDay = ((WORKING_DAY_END - WORKING_DAY_START) * 60) - LUNCH_DURATION - (BREAK_DURATION * 2);
    const numAvailableDays = sortedDays.length;
    
    // Durée idéale par jour pour équilibrer la charge
    let idealMinutesPerDay = Math.min(
      Math.ceil(totalThematicDuration / numAvailableDays),
      effectiveMinutesPerDay
    );
    
    // Toujours commencer avec une réunion d'ouverture le premier jour
    if (hasOpeningClosing && sortedDays.length > 0) {
      const firstDay = new Date(sortedDays[0]);
      setHours(firstDay, WORKING_DAY_START);
      setMinutes(firstDay, 0);
      
      interviewsToPreview.push({
        title: "Réunion d'ouverture",
        description: "Présentation de l'audit et des objectifs",
        startTime: firstDay.toISOString(),
        durationMinutes: OPENING_MEETING_DURATION,
        location: "Salle de réunion principale",
      });
    }
    
    // Générer les entretiens pour chaque thématique
    let currentDayIndex = 0;
    let currentTime = new Date(sortedDays[currentDayIndex]);
    let minutesScheduledToday = 0;
    
    // Si nous avons une réunion d'ouverture, commencer après
    if (hasOpeningClosing) {
      setHours(currentTime, WORKING_DAY_START + 1);
      setMinutes(currentTime, 0);
      minutesScheduledToday = OPENING_MEETING_DURATION;
    } else {
      setHours(currentTime, WORKING_DAY_START);
      setMinutes(currentTime, 0);
    }
    
    // Ajouter une pause café matinale
    if (currentTime.getHours() <= MORNING_BREAK_TIME) {
      const breakTime = new Date(currentTime);
      setHours(breakTime, MORNING_BREAK_TIME);
      setMinutes(breakTime, 0);
      
      interviewsToPreview.push({
        title: "Pause café",
        description: "Pause de 15 minutes",
        startTime: breakTime.toISOString(),
        durationMinutes: BREAK_DURATION,
        location: "Salle de pause",
      });
      
      // Passer au-delà de la pause
      if (currentTime.getHours() === MORNING_BREAK_TIME && currentTime.getMinutes() < BREAK_DURATION) {
        currentTime = new Date(currentTime);
        setMinutes(currentTime, BREAK_DURATION);
      }
    }
    
    // Planifier chaque entretien thématique
    for (const topicId of selectedTopicIds) {
      const theme = themes.find(t => t.id === topicId);
      if (!theme || systemThemeNames.includes(theme.name)) continue;
      
      // Durée par défaut si non spécifiée
      const duration = themeDurations[topicId] || 60;
      
      // Vérifier les pauses
      if (currentTime.getHours() === MORNING_BREAK_TIME && currentTime.getMinutes() < BREAK_DURATION) {
        currentTime = new Date(currentTime);
        setMinutes(currentTime, BREAK_DURATION);
      }
      
      // Vérifier le déjeuner
      if (isDuringLunch(currentTime)) {
        const lunchTime = new Date(currentTime);
        
        interviewsToPreview.push({
          title: "Pause déjeuner",
          description: "Pause d'une heure",
          startTime: lunchTime.toISOString(),
          durationMinutes: LUNCH_DURATION,
          location: "Restaurant d'entreprise",
        });
        
        setHours(currentTime, LUNCH_BREAK_END);
        setMinutes(currentTime, 0);
        // Réinitialiser le compteur de minutes pour l'après-midi
        minutesScheduledToday = 0;
      }
      
      // Vérifier si l'entretien chevauche la pause déjeuner
      const endTime = new Date(currentTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      if (currentTime.getHours() < LUNCH_BREAK_START && endTime.getHours() >= LUNCH_BREAK_START) {
        // L'entretien chevauche la pause déjeuner, il faut le décaler après
        const lunchTime = new Date(currentTime);
        setHours(lunchTime, LUNCH_BREAK_START);
        setMinutes(lunchTime, 0);
        
        interviewsToPreview.push({
          title: "Pause déjeuner",
          description: "Pause d'une heure",
          startTime: lunchTime.toISOString(),
          durationMinutes: LUNCH_DURATION,
          location: "Restaurant d'entreprise",
        });
        
        // Décaler l'entretien après le déjeuner
        setHours(currentTime, LUNCH_BREAK_END);
        setMinutes(currentTime, 0);
        // Réinitialiser le compteur de minutes pour l'après-midi
        minutesScheduledToday = 0;
      }
      
      // Vérifier la pause de l'après-midi
      if (currentTime.getHours() === AFTERNOON_BREAK_TIME && currentTime.getMinutes() < BREAK_DURATION) {
        const breakTime = new Date(currentTime);
        setMinutes(breakTime, 0);
        
        interviewsToPreview.push({
          title: "Pause café",
          description: "Pause de 15 minutes",
          startTime: breakTime.toISOString(),
          durationMinutes: BREAK_DURATION,
          location: "Salle de pause",
        });
        
        currentTime = new Date(currentTime);
        setMinutes(currentTime, BREAK_DURATION);
      }
      
      // Vérifier si nous devons passer au jour suivant pour équilibrer la charge
      if ((minutesScheduledToday + duration > idealMinutesPerDay && currentDayIndex < sortedDays.length - 1) ||
          currentTime.getHours() >= WORKING_DAY_END - 1) {
        currentDayIndex++;
        
        if (currentDayIndex >= sortedDays.length) {
          // Revenir au premier jour pour la prévisualisation
          currentDayIndex = 0;
        }
        
        currentTime = new Date(sortedDays[currentDayIndex]);
        setHours(currentTime, WORKING_DAY_START);
        setMinutes(currentTime, 0);
        minutesScheduledToday = 0;
        
        // Ajouter une pause café pour ce nouveau jour
        const breakTime = new Date(currentTime);
        setHours(breakTime, MORNING_BREAK_TIME);
        setMinutes(breakTime, 0);
        
        interviewsToPreview.push({
          title: "Pause café",
          description: "Pause de 15 minutes",
          startTime: breakTime.toISOString(),
          durationMinutes: BREAK_DURATION,
          location: "Salle de pause",
        });
      }
      
      // S'assurer que nous ne planifions pas après les heures de bureau
      if (currentTime.getHours() >= WORKING_DAY_END) {
        currentDayIndex++;
        
        if (currentDayIndex >= sortedDays.length) {
          // Revenir au premier jour pour la prévisualisation
          currentDayIndex = 0;
        }
        
        currentTime = new Date(sortedDays[currentDayIndex]);
        setHours(currentTime, WORKING_DAY_START);
        setMinutes(currentTime, 0);
        minutesScheduledToday = 0;
      }
      
      // S'assurer que nous ne commençons pas avant les heures de bureau
      if (currentTime.getHours() < WORKING_DAY_START) {
        setHours(currentTime, WORKING_DAY_START);
        setMinutes(currentTime, 0);
      }
      
      // Créer l'entretien
      interviewsToPreview.push({
        themeId: topicId,
        title: `Interview: ${theme.name}`,
        description: `Entretien sur la thématique: ${theme.name}`,
        startTime: currentTime.toISOString(),
        durationMinutes: duration,
        location: "À déterminer",
      });
      
      // Passer au créneau horaire suivant et mettre à jour les minutes programmées
      const nextSlot = getNextTimeSlot(
        currentTime, 
        duration, 
        sortedDays, 
        currentDayIndex,
        minutesScheduledToday,
        idealMinutesPerDay
      );
      
      currentTime = nextSlot.nextTime;
      currentDayIndex = nextSlot.newDayIndex;
      minutesScheduledToday = nextSlot.newMinutesScheduled;
      
      // Ajouter une pause de l'après-midi si nécessaire
      if (currentDayIndex === currentDayIndex && // Si on est toujours sur le même jour
          currentTime.getHours() < AFTERNOON_BREAK_TIME && // Et qu'on n'a pas encore atteint 16h
          minutesScheduledToday > 0) { // Et qu'on a déjà programmé quelque chose aujourd'hui
        
        const breakTime = new Date(sortedDays[currentDayIndex]);
        setHours(breakTime, AFTERNOON_BREAK_TIME);
        setMinutes(breakTime, 0);
        
        // Si on n'a pas déjà ajouté une pause à 16h pour ce jour
        const hasBreakAlready = interviewsToPreview.some(i => {
          const iTime = new Date(i.startTime || '');
          return iTime.getHours() === AFTERNOON_BREAK_TIME && 
                 iTime.getMinutes() === 0 &&
                 iTime.toDateString() === breakTime.toDateString();
        });
        
        if (!hasBreakAlready) {
          interviewsToPreview.push({
            title: "Pause café",
            description: "Pause de 15 minutes",
            startTime: breakTime.toISOString(),
            durationMinutes: BREAK_DURATION,
            location: "Salle de pause",
          });
        }
      }
    }
    
    // Ajouter une réunion de clôture le dernier jour
    if (hasOpeningClosing && sortedDays.length > 0) {
      const lastDay = new Date(sortedDays[sortedDays.length - 1]);
      setHours(lastDay, AFTERNOON_BREAK_TIME);
      setMinutes(lastDay, 15); // Juste après la pause de l'après-midi
      
      interviewsToPreview.push({
        title: "Réunion de clôture",
        description: "Présentation des conclusions préliminaires",
        startTime: lastDay.toISOString(),
        durationMinutes: CLOSING_MEETING_DURATION,
        location: "Salle de réunion principale",
      });
    }
    
    // Vérification finale: s'assurer qu'aucun interview ne commence avant 9h ou après 18h
    const fixedInterviews = interviewsToPreview.map(interview => {
      if (!interview.startTime) return interview;
      
      const startTime = new Date(interview.startTime);
      
      // Si l'interview commence avant 9h, le déplacer à 9h
      if (startTime.getHours() < WORKING_DAY_START) {
        const fixedTime = new Date(startTime);
        setHours(fixedTime, WORKING_DAY_START);
        setMinutes(fixedTime, 0);
        return {
          ...interview,
          startTime: fixedTime.toISOString()
        };
      }
      
      // Si l'interview finit après 18h, l'adapter
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (interview.durationMinutes || 60));
      
      if (endTime.getHours() >= WORKING_DAY_END || 
          (endTime.getHours() === WORKING_DAY_END && endTime.getMinutes() > 0)) {
        // Si possible, réduire la durée pour qu'il finisse à 18h
        const newDuration = (WORKING_DAY_END - startTime.getHours()) * 60 - startTime.getMinutes();
        if (newDuration >= 30) { // Minimum 30 minutes pour un entretien
          return {
            ...interview,
            durationMinutes: newDuration,
            description: `${interview.description} (Durée ajustée pour respecter les heures de bureau)`
          };
        }
        // Sinon, le déplacer au jour suivant à 9h (pour la prévisualisation)
        else {
          const nextDay = new Date(startTime);
          nextDay.setDate(nextDay.getDate() + 1);
          setHours(nextDay, WORKING_DAY_START);
          setMinutes(nextDay, 0);
          return {
            ...interview,
            startTime: nextDay.toISOString(),
            description: `${interview.description} (Déplacé au jour suivant pour respecter les heures de bureau)`
          };
        }
      }
      
      return interview;
    });
    
    // Trier les entretiens chronologiquement
    return fixedInterviews.sort((a, b) => {
      return new Date(a.startTime || '').getTime() - new Date(b.startTime || '').getTime();
    });
  } catch (error) {
    console.error("Erreur lors de la génération des entretiens de prévisualisation:", error);
    return [];
  }
};
