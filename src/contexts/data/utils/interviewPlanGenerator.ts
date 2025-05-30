
import { setHours, setMinutes, parseISO, addMinutes } from 'date-fns';
import { isValidUUID } from './interviewUtils';
import { deleteExistingInterviews, createInterviewsInDB, fetchInterviewsFromDB, InterviewInsert } from './interviewDbOps';
import { supabase } from '@/integrations/supabase/client';

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
  return hour >= LUNCH_BREAK_START && hour < LUNCH_BREAK_END;
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
 * Fonction utilitaire pour vérifier si un topic existe déjà
 */
const checkTopicExists = async (topicId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('audit_topics')
      .select('id')
      .eq('id', topicId)
      .limit(1);
      
    if (error) {
      console.error('Erreur lors de la vérification du topic:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification du topic:', error);
    return false;
  }
};

/**
 * Fonction utilitaire pour créer un topic temporaire si nécessaire
 */
const createTemporaryTopic = async (themeId: string): Promise<string | null> => {
  try {
    console.log(`Création d'un topic temporaire pour thème ${themeId}`);
    
    // Ne pas inclure audit_id car cette colonne n'existe pas dans la table
    const { data, error } = await supabase
      .from('audit_topics')
      .insert({
        name: `Topic temporaire pour thème ${themeId}`,
        description: "Topic créé automatiquement lors de la génération du plan"
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Erreur lors de la création du topic temporaire:', error);
      return null;
    }
    
    console.log(`Topic temporaire créé avec succès, id=${data.id}`);
    return data.id;
  } catch (error) {
    console.error('Erreur lors de la création du topic temporaire:', error);
    return null;
  }
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
    
    // Créer un topic spécifique pour la réunion d'ouverture
    const openingTopicId = await createTemporaryTopic("opening");
    
    if (!openingTopicId) {
      console.error("Impossible de créer un topic pour la réunion d'ouverture");
      return false;
    }
    
    dbInterviewsToCreate.push({
      audit_id: auditId,
      title: "Réunion d'ouverture",
      description: "Présentation de l'audit et des objectifs",
      start_time: firstDay.toISOString(),
      duration_minutes: 60,
      location: "Salle de réunion principale",
      meeting_link: "https://meet.google.com/meeting-ouverture",
      topic_id: openingTopicId // Associer le topic spécifique
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
    
    // Ajouter une pause café à 10h le premier jour
    const morningBreakTime = new Date(sortedDays[currentDayIndex]);
    setHours(morningBreakTime, MORNING_BREAK_TIME);
    setMinutes(morningBreakTime, 0);
    
    // Créer un topic pour la pause café
    const breakTopicId = await createTemporaryTopic("break");
    
    if (breakTopicId) {
      dbInterviewsToCreate.push({
        audit_id: auditId,
        title: "Pause café",
        description: "Pause de 15 minutes",
        start_time: morningBreakTime.toISOString(),
        duration_minutes: BREAK_DURATION,
        location: "Salle de pause",
        meeting_link: null,
        topic_id: breakTopicId
      });
    }
    
    // Traiter chaque thématique/topic
    for (const topicId of topicIds) {
      try {
        const duration = themeDurations[topicId] || 60;
        
        console.log(`Planification d'un entretien pour la thématique ${topicId} d'une durée de ${duration} minutes`);
        
        // Vérifier si le topic existe déjà
        let actualTopicId = topicId;
        const topicExists = await checkTopicExists(topicId);
        
        // Si le topic n'existe pas, il s'agit peut-être d'un ID de thème
        if (!topicExists) {
          console.log(`Le topic ${topicId} n'existe pas, création d'un topic temporaire`);
          const tempTopicId = await createTemporaryTopic(topicId);
          
          if (!tempTopicId) {
            console.error(`Impossible de créer un topic temporaire pour ${topicId}, on ignore cette thématique`);
            continue; // Passer à la thématique suivante
          }
          
          actualTopicId = tempTopicId;
          console.log(`Topic temporaire créé: ${actualTopicId} pour remplacer ${topicId}`);
        }
        
        // Cas spéciaux: pause café de 10h
        if (currentTime.getHours() === MORNING_BREAK_TIME && currentTime.getMinutes() === 0) {
          console.log(`On saute la pause café de 10h car déjà programmée`);
          currentTime = addMinutes(currentTime, BREAK_DURATION);
        }
        
        // Cas spéciaux: déjeuner
        if (isDuringLunch(currentTime)) {
          console.log(`Ajout d'une pause déjeuner automatique`);
          
          // Créer un topic pour le déjeuner
          const lunchTopicId = await createTemporaryTopic("lunch");
          
          if (lunchTopicId) {
            dbInterviewsToCreate.push({
              audit_id: auditId,
              title: "Pause déjeuner",
              description: "Pause d'une heure",
              start_time: new Date(currentTime).toISOString(),
              duration_minutes: LUNCH_DURATION,
              location: "Restaurant d'entreprise",
              meeting_link: null,
              topic_id: lunchTopicId
            });
          }
          
          currentTime = new Date(currentTime);
          setHours(currentTime, LUNCH_BREAK_END);
          setMinutes(currentTime, 0);
          minutesScheduledToday = 0; // Réinitialiser pour l'après-midi
        }
        
        // Vérifier si l'entretien chevauche la pause déjeuner
        const endTime = new Date(currentTime);
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        if (currentTime.getHours() < LUNCH_BREAK_START && endTime.getHours() >= LUNCH_BREAK_START) {
          console.log(`L'entretien chevauche la pause déjeuner, on programme une pause déjeuner`);
          
          // Créer un topic pour le déjeuner
          const lunchTopicId = await createTemporaryTopic("lunch");
          
          if (lunchTopicId) {
            const lunchTime = new Date(currentTime);
            setHours(lunchTime, LUNCH_BREAK_START);
            setMinutes(lunchTime, 0);
            
            dbInterviewsToCreate.push({
              audit_id: auditId,
              title: "Pause déjeuner",
              description: "Pause d'une heure",
              start_time: lunchTime.toISOString(),
              duration_minutes: LUNCH_DURATION,
              location: "Restaurant d'entreprise",
              meeting_link: null,
              topic_id: lunchTopicId
            });
          }
          
          currentTime = new Date(currentTime);
          setHours(currentTime, LUNCH_BREAK_END);
          setMinutes(currentTime, 0);
          minutesScheduledToday = 0; // Réinitialiser pour l'après-midi
        }
        
        // Cas spéciaux: pause café de l'après-midi
        if (currentTime.getHours() === AFTERNOON_BREAK_TIME && currentTime.getMinutes() === 0) {
          console.log(`Ajout d'une pause café à 16h`);
          
          // Créer un topic pour la pause
          const breakTopicId = await createTemporaryTopic("break");
          
          if (breakTopicId) {
            dbInterviewsToCreate.push({
              audit_id: auditId,
              title: "Pause café",
              description: "Pause de 15 minutes",
              start_time: new Date(currentTime).toISOString(),
              duration_minutes: BREAK_DURATION,
              location: "Salle de pause",
              meeting_link: null,
              topic_id: breakTopicId
            });
          }
          
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
          
          // Ajouter une pause café pour ce nouveau jour
          const morningBreakNewDay = new Date(sortedDays[currentDayIndex]);
          setHours(morningBreakNewDay, MORNING_BREAK_TIME);
          setMinutes(morningBreakNewDay, 0);
          
          const newDayBreakTopicId = await createTemporaryTopic("break");
          
          if (newDayBreakTopicId) {
            dbInterviewsToCreate.push({
              audit_id: auditId,
              title: "Pause café",
              description: "Pause de 15 minutes",
              start_time: morningBreakNewDay.toISOString(),
              duration_minutes: BREAK_DURATION,
              location: "Salle de pause",
              meeting_link: null,
              topic_id: newDayBreakTopicId
            });
          }
        }
        
        // S'assurer que le planning est toujours dans les heures de bureau
        if (currentTime.getHours() < WORKING_DAY_START) {
          currentTime = new Date(currentTime);
          setHours(currentTime, WORKING_DAY_START);
          setMinutes(currentTime, 0);
        } else if (currentTime.getHours() >= WORKING_DAY_END) {
          // Si nous sommes en fin de journée, passer au jour suivant
          currentDayIndex++;
          if (currentDayIndex >= sortedDays.length) {
            currentDayIndex = 0;
          }
          currentTime = new Date(sortedDays[currentDayIndex]);
          setHours(currentTime, WORKING_DAY_START);
          setMinutes(currentTime, 0);
          minutesScheduledToday = 0;
        }
        
        // Créer l'entretien thématique
        console.log(`Création d'un entretien pour la thématique ${topicId} (topic_id=${actualTopicId}) à ${currentTime.toISOString()}`);
        
        // Extraire le nom de la thématique du topicId pour améliorer le titre
        let themeName = topicId.replace(/theme-/g, '').substring(0, 8);
        
        dbInterviewsToCreate.push({
          audit_id: auditId,
          title: `Entretien: Thématique ${themeName}`,
          description: "Entretien sur la thématique",
          start_time: currentTime.toISOString(),
          duration_minutes: duration,
          location: "Salle d'entretien",
          meeting_link: `https://meet.google.com/${auditId.substring(0, 8)}-${topicId.substring(0, 8)}`,
          topic_id: actualTopicId // Utiliser l'ID de topic valide
        });
        
        // Mettre à jour le temps et les minutes programmées
        currentTime = addMinutes(new Date(currentTime), duration);
        minutesScheduledToday += duration;
        
        // Si nous approchons de la pause de l'après-midi, l'ajouter
        if (currentDayIndex === currentDayIndex && // Si on est toujours sur le même jour
            currentTime.getHours() === AFTERNOON_BREAK_TIME && // Et qu'on est à 16h
            currentTime.getMinutes() === 0) { // Et qu'on est à 0 minute
          
          const afternoonBreakTopicId = await createTemporaryTopic("break");
          
          if (afternoonBreakTopicId) {
            console.log(`Ajout d'une pause café à 16h`);
            
            dbInterviewsToCreate.push({
              audit_id: auditId,
              title: "Pause café",
              description: "Pause de 15 minutes",
              start_time: new Date(currentTime).toISOString(),
              duration_minutes: BREAK_DURATION,
              location: "Salle de pause",
              meeting_link: null,
              topic_id: afternoonBreakTopicId
            });
            
            currentTime = addMinutes(new Date(currentTime), BREAK_DURATION);
          }
        }
      } catch (topicError) {
        console.error(`Erreur lors du traitement du topic ${topicId}:`, topicError);
        // Continuer avec le topic suivant
      }
    }
    
    // Dernier jour - Réunion de clôture à 16h15 (après la pause de 16h)
    const lastDay = new Date(sortedDays[sortedDays.length - 1]);
    setHours(lastDay, AFTERNOON_BREAK_TIME);
    setMinutes(lastDay, 15);
    
    console.log(`Création d'une réunion de clôture le ${lastDay.toISOString()}`);
    
    // Créer un topic spécifique pour la réunion de clôture
    const closingTopicId = await createTemporaryTopic("closing");
    
    if (!closingTopicId) {
      console.error("Impossible de créer un topic pour la réunion de clôture");
      // On continue quand même car c'est pas critique
    } else {
      dbInterviewsToCreate.push({
        audit_id: auditId,
        title: "Réunion de clôture",
        description: "Présentation des conclusions préliminaires",
        start_time: lastDay.toISOString(),
        duration_minutes: 60,
        location: "Salle de réunion principale",
        meeting_link: "https://meet.google.com/meeting-cloture",
        topic_id: closingTopicId
      });
    }
    
    // Insérer tous les entretiens en une seule fois
    if (dbInterviewsToCreate.length > 0) {
      console.log(`Création de ${dbInterviewsToCreate.length} entretiens pour l'audit ${auditId}`);
      
      // Log détaillé pour debug
      console.log("Premiers entretiens à insérer:", dbInterviewsToCreate.slice(0, 3));
      
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
