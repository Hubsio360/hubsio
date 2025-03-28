
import { setHours, setMinutes, parseISO, addMinutes } from 'date-fns';
import { isValidUUID } from './interviewUtils';
import { deleteExistingInterviews, createInterviewsInDB, fetchInterviewsFromDB, InterviewInsert } from './interviewDbOps';

// Constantes pour les horaires et pauses
const WORKING_DAY_START = 9; // 9h00
const MORNING_BREAK_TIME = 10; // 10h00
const LUNCH_BREAK_START = 12; // 12h00
const LUNCH_BREAK_END = 13; // 13h00
const AFTERNOON_BREAK_TIME = 16; // 16h00
const WORKING_DAY_END = 18; // 18h00
const BREAK_DURATION = 15; // 15 minutes
const LUNCH_DURATION = 60; // 60 minutes

/**
 * Vérifie si un horaire est pendant la pause déjeuner (12h-13h)
 */
const isDuringLunch = (time: Date): boolean => {
  const hour = time.getHours();
  return hour === LUNCH_BREAK_START;
};

/**
 * Vérifie si un horaire est pendant une pause café (10h ou 16h)
 */
const isDuringCoffeeBreak = (time: Date): boolean => {
  const hour = time.getHours();
  const minute = time.getMinutes();
  return (hour === MORNING_BREAK_TIME && minute === 0) || 
         (hour === AFTERNOON_BREAK_TIME && minute === 0);
};

/**
 * Génère un planning d'audit équilibré sur les jours disponibles
 */
export const generatePlanSchedule = async (
  auditId: string, 
  startDate: string, 
  endDate: string, 
  options?: {
    topicIds?: string[];
    selectedDays?: string[];
    themeDurations?: Record<string, number>;
    maxHoursPerDay?: number;
  }
): Promise<boolean> => {
  try {
    console.log(`Génération d'un plan d'audit ID: ${auditId} avec options:`, options);
    
    if (!auditId) {
      console.error('Aucun ID d\'audit fourni pour la génération du plan');
      return false;
    }
    
    const maxHoursPerDay = options?.maxHoursPerDay || 8;
    const selectedDays = options?.selectedDays || [];
    const topicIds = options?.topicIds || [];
    const themeDurations = options?.themeDurations || {};
    
    if (selectedDays.length === 0) {
      console.error('Aucun jour sélectionné pour le plan d\'audit');
      return false;
    }
    
    if (!isValidUUID(auditId)) {
      console.error(`Format UUID invalide pour auditId: ${auditId}`);
      return false;
    }
    
    // Supprimer les entretiens existants
    console.log(`Suppression des entretiens existants pour l'audit: ${auditId}`);
    const deleteResult = await deleteExistingInterviews(auditId);
    console.log(`Résultat de la suppression des entretiens existants: ${deleteResult}`);
    
    if (!deleteResult) {
      console.error("Échec de la suppression des entretiens existants");
      return false;
    }
    
    // Trier les jours sélectionnés chronologiquement
    const sortedDays = [...selectedDays].sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    console.log(`Jours sélectionnés triés: ${sortedDays}`);
    
    // Calculer la durée totale des entretiens thématiques
    let totalThematicDuration = 0;
    topicIds.forEach(topicId => {
      const duration = themeDurations[topicId] || 60;
      totalThematicDuration += duration;
    });
    
    console.log(`Durée totale des entretiens thématiques: ${totalThematicDuration} minutes`);
    
    // Préparer les données des entretiens à créer
    const dbInterviewsToCreate: InterviewInsert[] = [];
    
    // Jour 1 - Réunion d'ouverture à 9h
    const firstDay = new Date(sortedDays[0]);
    setHours(firstDay, WORKING_DAY_START);
    setMinutes(firstDay, 0);
    
    console.log(`Création d'une réunion d'ouverture le ${firstDay.toISOString()}`);
    
    dbInterviewsToCreate.push({
      audit_id: auditId,
      title: "Réunion d'ouverture",
      description: "Présentation de l'audit et des objectifs",
      start_time: firstDay.toISOString(),
      duration_minutes: 60,
      location: "Salle de réunion principale",
      meeting_link: "https://meet.google.com/meeting-ouverture", // Lien par défaut que les utilisateurs pourront modifier
      theme_id: null // Pas de thématique spécifique pour la réunion d'ouverture
    });
    
    // Calculer comment équilibrer les thèmes sur les jours disponibles
    // Durée disponible par jour en minutes (en excluant pauses et déjeuner)
    const effectiveMinutesPerDay = (maxHoursPerDay * 60) - LUNCH_DURATION - (BREAK_DURATION * 2);
    const numAvailableDays = sortedDays.length;
    
    // Distribuer les interviews de façon équilibrée
    let idealMinutesPerDay = Math.ceil(totalThematicDuration / numAvailableDays);
    if (idealMinutesPerDay > effectiveMinutesPerDay) {
      idealMinutesPerDay = effectiveMinutesPerDay;
    }
    
    console.log(`Minutes idéales par jour: ${idealMinutesPerDay}, minutes effectives disponibles: ${effectiveMinutesPerDay}`);
    
    // Planifier les entretiens thématiques
    let currentDayIndex = 0;
    let currentTime = new Date(sortedDays[currentDayIndex]);
    // Commencer après la réunion d'ouverture le premier jour
    setHours(currentTime, WORKING_DAY_START + 1);
    setMinutes(currentTime, 0);
    
    let minutesScheduledToday = 60; // Compter la réunion d'ouverture pour le premier jour
    
    console.log(`Planification de ${topicIds.length} entretiens thématiques à partir de ${currentTime.toISOString()}`);
    
    for (const topicId of topicIds) {
      const duration = themeDurations[topicId] || 60;
      
      console.log(`Planification d'un entretien pour la thématique ${topicId} d'une durée de ${duration} minutes`);
      
      // Vérifier s'il reste assez de temps aujourd'hui
      const timeAfterInterview = addMinutes(new Date(currentTime), duration);
      
      // Cas spéciaux: pause café de 10h
      if (currentTime.getHours() === MORNING_BREAK_TIME && currentTime.getMinutes() === 0) {
        console.log(`Ajout d'une pause café à 10h`);
        currentTime = addMinutes(currentTime, BREAK_DURATION);
        dbInterviewsToCreate.push({
          audit_id: auditId,
          title: "Pause café",
          description: "Pause de 15 minutes",
          start_time: new Date(currentTime).toISOString(),
          duration_minutes: BREAK_DURATION,
          location: "Salle de pause",
          meeting_link: null, // Pas de lien pour les pauses
          theme_id: null // Pas de thématique pour les pauses
        });
        currentTime = addMinutes(currentTime, BREAK_DURATION);
      }
      
      // Cas spéciaux: déjeuner
      if (isDuringLunch(currentTime) || isDuringLunch(timeAfterInterview)) {
        console.log(`Ajout d'une pause déjeuner`);
        dbInterviewsToCreate.push({
          audit_id: auditId,
          title: "Pause déjeuner",
          description: "Pause d'une heure",
          start_time: new Date(currentTime).toISOString(),
          duration_minutes: LUNCH_DURATION,
          location: "Restaurant d'entreprise",
          meeting_link: null, // Pas de lien pour le déjeuner
          theme_id: null // Pas de thématique pour le déjeuner
        });
        currentTime = new Date(currentTime);
        setHours(currentTime, LUNCH_BREAK_END);
        setMinutes(currentTime, 0);
      }
      
      // Cas spéciaux: pause café de l'après-midi
      if (currentTime.getHours() === AFTERNOON_BREAK_TIME && currentTime.getMinutes() === 0) {
        console.log(`Ajout d'une pause café à 16h`);
        dbInterviewsToCreate.push({
          audit_id: auditId,
          title: "Pause café",
          description: "Pause de 15 minutes",
          start_time: new Date(currentTime).toISOString(),
          duration_minutes: BREAK_DURATION,
          location: "Salle de pause",
          meeting_link: null, // Pas de lien pour les pauses
          theme_id: null // Pas de thématique pour les pauses
        });
        currentTime = addMinutes(currentTime, BREAK_DURATION);
      }
      
      // Passer au jour suivant si:
      // 1. Nous avons dépassé le temps idéal par jour
      // 2. L'entretien ne peut pas se terminer avant 18h
      // 3. Nous avons assez de jours pour répartir la charge
      if ((minutesScheduledToday + duration > idealMinutesPerDay && currentDayIndex < sortedDays.length - 1) ||
          (currentTime.getHours() >= WORKING_DAY_END - 1 && duration > 30)) {
        console.log(`Passage au jour suivant`);
        currentDayIndex++;
        if (currentDayIndex >= sortedDays.length) {
          console.log(`Attention: Pas assez de jours disponibles, retour au premier jour`);
          currentDayIndex = 0;
        }
        currentTime = new Date(sortedDays[currentDayIndex]);
        setHours(currentTime, WORKING_DAY_START);
        setMinutes(currentTime, 0);
        minutesScheduledToday = 0;
        
        // Si c'est 9h, vérifiez à nouveau pour les pauses
        if (currentTime.getHours() === MORNING_BREAK_TIME && currentTime.getMinutes() === 0) {
          currentTime = addMinutes(currentTime, BREAK_DURATION);
        }
      }
      
      // Créer l'entretien thématique
      console.log(`Création d'un entretien pour la thématique ${topicId} à ${currentTime.toISOString()}`);
      dbInterviewsToCreate.push({
        audit_id: auditId,
        title: `Entretien: Thématique ${topicId.replace(/theme-/g, '')}`,
        description: "Entretien sur la thématique",
        start_time: currentTime.toISOString(),
        duration_minutes: duration,
        location: "Salle d'entretien",
        meeting_link: `https://meet.google.com/${auditId.substring(0, 8)}-${topicId.substring(0, 8)}`, // Lien par défaut que les utilisateurs pourront modifier
        theme_id: topicId // Associer la thématique à l'entretien
      });
      
      // Mettre à jour le temps et les minutes programmées aujourd'hui
      currentTime = addMinutes(new Date(currentTime), duration);
      minutesScheduledToday += duration;
    }
    
    // Dernier jour - Réunion de clôture à 16h15 (après la pause de 16h)
    const lastDay = new Date(sortedDays[sortedDays.length - 1]);
    setHours(lastDay, AFTERNOON_BREAK_TIME);
    setMinutes(lastDay, 15);
    
    console.log(`Création d'une réunion de clôture le ${lastDay.toISOString()}`);
    
    dbInterviewsToCreate.push({
      audit_id: auditId,
      title: "Réunion de clôture",
      description: "Présentation des conclusions préliminaires",
      start_time: lastDay.toISOString(),
      duration_minutes: 60,
      location: "Salle de réunion principale",
      meeting_link: "https://meet.google.com/meeting-cloture", // Lien par défaut que les utilisateurs pourront modifier
      theme_id: null // Pas de thématique spécifique pour la réunion de clôture
    });
    
    // Insérer tous les entretiens en une seule fois
    if (dbInterviewsToCreate.length > 0) {
      console.log(`Création de ${dbInterviewsToCreate.length} entretiens pour l'audit ${auditId}`);
      const insertResult = await createInterviewsInDB(dbInterviewsToCreate);
      console.log(`Résultat de l'insertion: ${insertResult}`);
      
      if (insertResult) {
        // Vérifier que les interviews ont bien été créées
        const createdInterviews = await fetchInterviewsFromDB(auditId);
        console.log(`Nombre d'interviews créées et récupérées: ${createdInterviews.length}`);
        
        if (createdInterviews.length > 0) {
          return true;
        } else {
          console.error("Aucune interview trouvée après insertion");
          return false;
        }
      }
      return insertResult;
    } else {
      console.error('Aucun entretien à créer');
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la génération du plan d\'audit:', error);
    return false;
  }
};

/**
 * Fonction pour vérifier si un audit a un plan existant
 */
export const checkAuditHasPlan = async (auditId: string): Promise<boolean> => {
  try {
    const interviews = await fetchInterviewsFromDB(auditId);
    return interviews.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification si l\'audit a un plan:', error);
    return false;
  }
};
