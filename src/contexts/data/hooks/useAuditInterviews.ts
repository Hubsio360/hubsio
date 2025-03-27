
import { useState } from 'react';
import { AuditInterview, InterviewParticipant } from '@/types';
import { 
  fetchInterviewsFromDB, 
  addInterviewToDB, 
  updateInterviewInDB, 
  deleteInterviewFromDB, 
  addParticipantToDB,
  removeParticipantFromDB, 
  getParticipantsByInterviewIdFromDB 
} from '../utils/interviewDbOps';
import { generatePlanSchedule, checkAuditHasPlan } from '../utils/interviewPlanGenerator';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour gérer les entretiens d'audit
 */
export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [frameworkThemes, setFrameworkThemes] = useState<{id: string, name: string, description: string}[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(false);

  const fetchRealInterviewsFromDB = fetchInterviewsFromDB;

  const fetchInterviewsByAuditId = async (auditId: string): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      console.log('Récupération des entretiens pour l\'audit:', auditId);
      
      if (!auditId || auditId.length === 0) {
        console.log('ID d\'audit invalide fourni, retour tableau vide');
        setInterviews([]);
        return [];
      }
      
      const interviews = await fetchInterviewsFromDB(auditId);
      setInterviews(interviews);
      return interviews;
    } catch (error) {
      console.error('Erreur dans fetchInterviewsByAuditId:', error);
      setInterviews([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchThemesByFrameworkId = async (frameworkId: string): Promise<{id: string, name: string, description: string}[]> => {
    setLoadingThemes(true);
    try {
      console.log('Récupération des thématiques pour le framework:', frameworkId);
      
      if (!frameworkId || frameworkId.length === 0) {
        console.log('ID de framework invalide fourni, retour tableau vide');
        setFrameworkThemes([]);
        return [];
      }
      
      // Modification de la requête pour rechercher les thématiques en relation avec le framework
      // en passant par la table audit_topics qui fait le lien
      console.log('Requête pour récupérer les topics liés au framework:', frameworkId);
      const { data: topicsData, error: topicsError } = await supabase
        .from('audit_topics')
        .select('*, framework_controls(framework_id)')
        .filter('framework_controls.framework_id', 'eq', frameworkId);
        
      if (topicsError) {
        console.error('Erreur lors de la récupération des topics:', topicsError);
        
        // Si erreur, fallback pour récupérer toutes les thématiques disponibles
        console.log('Fallback: récupération de toutes les thématiques disponibles');
        const { data: themes, error: themesError } = await supabase
          .from('audit_themes')
          .select('*')
          .order('name');
          
        if (themesError) {
          console.error('Erreur lors de la récupération des thématiques (fallback):', themesError);
          setFrameworkThemes([]);
          return [];
        }
        
        const formattedThemes = themes.map(theme => ({
          id: theme.id,
          name: theme.name,
          description: theme.description || ''
        }));
        
        console.log(`Récupéré ${formattedThemes.length} thématiques depuis la base de données (fallback)`, formattedThemes);
        setFrameworkThemes(formattedThemes);
        return formattedThemes;
      }
      
      if (!topicsData || topicsData.length === 0) {
        console.log('Aucun topic trouvé pour ce framework, utilisation du fallback');
        
        // Si aucun topic, fallback pour récupérer toutes les thématiques
        const { data: themes, error: themesError } = await supabase
          .from('audit_themes')
          .select('*')
          .order('name');
          
        if (themesError) {
          console.error('Erreur lors de la récupération des thématiques (fallback):', themesError);
          setFrameworkThemes([]);
          return [];
        }
        
        const formattedThemes = themes.map(theme => ({
          id: theme.id,
          name: theme.name,
          description: theme.description || ''
        }));
        
        console.log(`Récupéré ${formattedThemes.length} thématiques depuis la base de données (fallback)`, formattedThemes);
        setFrameworkThemes(formattedThemes);
        return formattedThemes;
      }
      
      // Récupérer les IDs des thématiques liées aux topics
      console.log(`Récupéré ${topicsData.length} topics liés au framework, recherche des thématiques associées`);
      
      // Correction ici: nous utilisons l'ID du topic directement puisque c'est ce que nous avons
      // Les topics n'ont pas de theme_id dans la réponse de l'API
      const themeIds = new Set<string>();
      for (const topic of topicsData) {
        // Utiliser l'ID du topic lui-même au lieu d'un theme_id qui n'existe pas
        themeIds.add(topic.id);
      }
      
      if (themeIds.size === 0) {
        console.log('Aucune thématique trouvée dans les topics, utilisation du fallback');
        
        // Si aucune thématique liée, fallback
        const { data: themes, error: themesError } = await supabase
          .from('audit_themes')
          .select('*')
          .order('name');
          
        if (themesError) {
          console.error('Erreur lors de la récupération des thématiques (fallback):', themesError);
          setFrameworkThemes([]);
          return [];
        }
        
        const formattedThemes = themes.map(theme => ({
          id: theme.id,
          name: theme.name,
          description: theme.description || ''
        }));
        
        console.log(`Récupéré ${formattedThemes.length} thématiques depuis la base de données (fallback)`, formattedThemes);
        setFrameworkThemes(formattedThemes);
        return formattedThemes;
      }
      
      // Récupérer les thématiques par IDs
      const { data: themes, error: themesError } = await supabase
        .from('audit_themes')
        .select('*')
        .in('id', Array.from(themeIds))
        .order('name');
        
      if (themesError) {
        console.error('Erreur lors de la récupération des thématiques par IDs:', themesError);
        setFrameworkThemes([]);
        return [];
      }
      
      const formattedThemes = themes.map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description || ''
      }));
      
      console.log(`Récupéré ${formattedThemes.length} thématiques spécifiques au framework`, formattedThemes);
      
      if (formattedThemes.length === 0) {
        console.log('Aucune thématique récupérée par IDs, utilisation du fallback');
        
        // Si aucune thématique récupérée, fallback
        const { data: allThemes, error: allThemesError } = await supabase
          .from('audit_themes')
          .select('*')
          .order('name');
          
        if (allThemesError) {
          console.error('Erreur lors de la récupération des thématiques (fallback final):', allThemesError);
          setFrameworkThemes([]);
          return [];
        }
        
        const allFormattedThemes = allThemes.map(theme => ({
          id: theme.id,
          name: theme.name,
          description: theme.description || ''
        }));
        
        console.log(`Récupéré ${allFormattedThemes.length} thématiques depuis la base de données (fallback final)`, allFormattedThemes);
        setFrameworkThemes(allFormattedThemes);
        return allFormattedThemes;
      }
      
      setFrameworkThemes(formattedThemes);
      return formattedThemes;
    } catch (error) {
      console.error('Erreur dans fetchThemesByFrameworkId:', error);
      
      // En cas d'erreur, tentative de récupérer toutes les thématiques
      try {
        console.log('Erreur détectée, tentative de récupération de toutes les thématiques');
        const { data: themes } = await supabase
          .from('audit_themes')
          .select('*')
          .order('name');
          
        const formattedThemes = (themes || []).map(theme => ({
          id: theme.id,
          name: theme.name,
          description: theme.description || ''
        }));
        
        console.log(`Récupéré ${formattedThemes.length} thématiques depuis la base de données (après erreur)`, formattedThemes);
        setFrameworkThemes(formattedThemes);
        return formattedThemes;
      } catch (fallbackError) {
        console.error('Erreur dans le fallback de fetchThemesByFrameworkId:', fallbackError);
        setFrameworkThemes([]);
        return [];
      }
    } finally {
      setLoadingThemes(false);
    }
  };

  const addInterview = async (interview: Omit<AuditInterview, 'id'>): Promise<AuditInterview | null> => {
    try {
      const newInterview = await addInterviewToDB(interview);
      
      if (newInterview) {
        setInterviews((prev) => [...prev, newInterview]);
      }
      
      return newInterview;
    } catch (error) {
      console.error('Erreur dans addInterview:', error);
      return null;
    }
  };

  const updateInterview = async (
    id: string,
    updates: Partial<AuditInterview>
  ): Promise<AuditInterview | null> => {
    try {
      const updatedInterview = await updateInterviewInDB(id, updates);
      
      if (updatedInterview) {
        setInterviews((prev) =>
          prev.map((interview) => (interview.id === id ? updatedInterview : interview))
        );
      }
      
      return updatedInterview;
    } catch (error) {
      console.error('Erreur dans updateInterview:', error);
      return null;
    }
  };

  const deleteInterview = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteInterviewFromDB(id);
      
      if (success) {
        setInterviews((prev) => prev.filter((interview) => interview.id !== id));
      }
      
      return success;
    } catch (error) {
      console.error('Erreur dans deleteInterview:', error);
      return false;
    }
  };

  const addParticipant = async (participant: Omit<InterviewParticipant, 'notificationSent'>): Promise<boolean> => {
    return addParticipantToDB(participant);
  };

  const removeParticipant = async (interviewId: string, userId: string): Promise<boolean> => {
    return removeParticipantFromDB(interviewId, userId);
  };

  const getParticipantsByInterviewId = async (interviewId: string): Promise<InterviewParticipant[]> => {
    return getParticipantsByInterviewIdFromDB(interviewId);
  };

  const hasPlanForAudit = async (auditId: string): Promise<boolean> => {
    return checkAuditHasPlan(auditId);
  };

  const generateAuditPlan = async (
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
      const success = await generatePlanSchedule(auditId, startDate, endDate, options);
      
      if (success) {
        const newInterviews = await fetchInterviewsFromDB(auditId);
        setInterviews(newInterviews);
      }
      
      return success;
    } catch (error) {
      console.error('Erreur dans generateAuditPlan:', error);
      return false;
    }
  };

  return {
    interviews,
    loading,
    fetchInterviewsByAuditId,
    fetchRealInterviewsFromDB,
    addInterview,
    updateInterview,
    deleteInterview,
    addParticipant,
    removeParticipant,
    getParticipantsByInterviewId,
    generateAuditPlan,
    hasPlanForAudit,
    frameworkThemes,
    loadingThemes,
    fetchThemesByFrameworkId
  };
};
