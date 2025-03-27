import { useState } from 'react';
import { AuditInterview } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterviews = async (): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_interviews')
        .select('*')
        .order('startTime');
      
      if (error) {
        console.error('Error fetching audit interviews:', error);
        return [];
      }
      
      const fetchedInterviews = (data || []).map(interview => ({
        id: interview.id,
        auditId: interview.auditId,
        topicId: interview.topicId || '',
        themeId: interview.themeId || '',
        title: interview.title,
        description: interview.description || '',
        startTime: interview.startTime,
        durationMinutes: interview.durationMinutes,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        controlRefs: interview.controlRefs || ''
      }));
      
      setInterviews(fetchedInterviews);
      return fetchedInterviews;
    } catch (error) {
      console.error('Error fetching audit interviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchRealInterviewsFromDB = async (auditId: string): Promise<AuditInterview[]> => {
    try {
      const { data, error } = await supabase
        .from('audit_interviews')
        .select('*')
        .eq('auditId', auditId)
        .order('startTime');
      
      if (error) {
        console.error('Error fetching audit interviews:', error);
        return [];
      }
      
      const fetchedInterviews = (data || []).map(interview => ({
        id: interview.id,
        auditId: interview.auditId,
        topicId: interview.topicId || '',
        themeId: interview.themeId || '',
        title: interview.title,
        description: interview.description || '',
        startTime: interview.startTime,
        durationMinutes: interview.durationMinutes,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        controlRefs: interview.controlRefs || ''
      }));
      
      return fetchedInterviews;
    } catch (error) {
      console.error('Error fetching audit interviews:', error);
      return [];
    }
  };

  const fetchInterviewsByAuditId = async (auditId: string): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      console.log(`Fetching audit interviews for audit ID: ${auditId}`);
      const { data, error } = await supabase
        .from('audit_interviews')
        .select('*')
        .eq('auditId', auditId)
        .order('startTime');
      
      if (error) {
        console.error('Error fetching audit interviews:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log('No audit interviews found for this audit.');
        return [];
      }
      
      console.log(`Found ${data.length} audit interviews`);
      
      const fetchedInterviews = data.map(interview => ({
        id: interview.id,
        auditId: interview.auditId,
        topicId: interview.topicId || '',
        themeId: interview.themeId || '',
        title: interview.title,
        description: interview.description || '',
        startTime: interview.startTime,
        durationMinutes: interview.durationMinutes,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        controlRefs: interview.controlRefs || ''
      }));
      
      setInterviews(fetchedInterviews);
      return fetchedInterviews;
    } catch (error) {
      console.error('Error fetching audit interviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addInterview = async (interview: Omit<AuditInterview, 'id'>): Promise<AuditInterview | null> => {
    try {
      console.log("Adding new audit interview:", interview);
      
      const { data, error } = await supabase
        .from('audit_interviews')
        .insert([interview])
        .select();
      
      if (error) {
        console.error('Error adding audit interview:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from insert operation');
        return null;
      }
      
      console.log("Interview added successfully:", data[0]);
      
      const newInterview: AuditInterview = {
        id: data[0].id,
        auditId: data[0].auditId,
        topicId: data[0].topicId || '',
        themeId: data[0].themeId || '',
        title: data[0].title,
        description: data[0].description || '',
        startTime: data[0].startTime,
        durationMinutes: data[0].durationMinutes,
        location: data[0].location || '',
        meetingLink: data[0].meetingLink || '',
        controlRefs: data[0].controlRefs || ''
      };
      
      setInterviews(prev => [...prev, newInterview]);
      return newInterview;
    } catch (error) {
      console.error('Error adding audit interview:', error);
      return null;
    }
  };

  const updateInterview = async (id: string, updates: Partial<AuditInterview>): Promise<AuditInterview | null> => {
    try {
      console.log(`Updating interview with id ${id}:`, updates);
      
      const { data, error } = await supabase
        .from('audit_interviews')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating audit interview:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from update operation');
        return null;
      }
      
      console.log("Interview updated successfully:", data[0]);
      
      const updatedInterview: AuditInterview = {
        id: data[0].id,
        auditId: data[0].auditId,
        topicId: data[0].topicId || '',
        themeId: data[0].themeId || '',
        title: data[0].title,
        description: data[0].description || '',
        startTime: data[0].startTime,
        durationMinutes: data[0].durationMinutes,
        location: data[0].location || '',
        meetingLink: data[0].meetingLink || '',
        controlRefs: data[0].controlRefs || ''
      };
      
      setInterviews(prev =>
        prev.map(interview => (interview.id === id ? updatedInterview : interview))
      );
      
      return updatedInterview;
    } catch (error) {
      console.error('Error updating audit interview:', error);
      return null;
    }
  };

  const deleteInterview = async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting interview with id ${id}`);
      
      const { error } = await supabase
        .from('audit_interviews')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting audit interview:', error);
        return false;
      }
      
      console.log("Interview deleted successfully");
      
      setInterviews(prev => prev.filter(interview => interview.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting audit interview:', error);
      return false;
    }
  };

  const addParticipant = async (interviewId: string, userId: string, role: string): Promise<boolean> => {
    try {
      console.log(`Adding participant ${userId} with role ${role} to interview ${interviewId}`);
      
      const { error } = await supabase
        .from('interview_participants')
        .insert([{ interviewId, userId, role, notificationSent: false }]);
      
      if (error) {
        console.error('Error adding participant:', error);
        return false;
      }
      
      console.log("Participant added successfully");
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      return false;
    }
  };

  const removeParticipant = async (interviewId: string, userId: string): Promise<boolean> => {
    try {
      console.log(`Removing participant ${userId} from interview ${interviewId}`);
      
      const { error } = await supabase
        .from('interview_participants')
        .delete()
        .eq('interviewId', interviewId)
        .eq('userId', userId);
      
      if (error) {
        console.error('Error removing participant:', error);
        return false;
      }
      
      console.log("Participant removed successfully");
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      return false;
    }
  };

  const getParticipantsByInterviewId = async (interviewId: string): Promise<{ interviewId: string; userId: string; role: string; notificationSent: boolean; }[]> => {
    try {
      console.log(`Fetching participants for interview ${interviewId}`);
      
      const { data, error } = await supabase
        .from('interview_participants')
        .select('*')
        .eq('interviewId', interviewId);
      
      if (error) {
        console.error('Error fetching participants:', error);
        return [];
      }
      
      console.log(`Found ${data.length} participants`);
      return data.map(participant => ({
        interviewId: participant.interviewId,
        userId: participant.userId,
        role: participant.role,
        notificationSent: participant.notificationSent
      }));
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  };

  const generateAuditPlan = async (auditId: string, startDate: string, endDate: string, options?: {
    topicIds?: string[];
    selectedDays?: string[];
    themeDurations?: Record<string, number>;
    maxHoursPerDay?: number;
  }): Promise<boolean> => {
    // Placeholder function - implement your audit plan generation logic here
    console.log('Generating audit plan with options:', auditId, startDate, endDate, options);
    return true;
  };

  // Cette fonction sera ajoutée ou mise à jour dans le hook useAuditInterviews
const fetchThemesByFrameworkId = async (frameworkId: string): Promise<{ id: string, name: string, description: string }[]> => {
  console.log(`Début de fetchThemesByFrameworkId pour le framework: ${frameworkId}`);
  
  try {
    // D'abord, essayons de récupérer toutes les thématiques disponibles
    const { data: themes, error: themesError } = await supabase
      .from('audit_themes')
      .select('*')
      .order('name');
    
    if (themesError) {
      console.error('Erreur lors de la récupération des thématiques:', themesError);
      throw new Error('Erreur lors de la récupération des thématiques');
    }
    
    if (!themes || themes.length === 0) {
      console.error('Aucune thématique disponible dans la base de données');
      
      // Si aucune thématique n'existe, créons-en quelques-unes par défaut
      const defaultThemes = [
        { name: 'Gouvernance', description: 'Thématiques liées à la gouvernance de la sécurité' },
        { name: 'Technique', description: 'Aspects techniques de la sécurité de l\'information' },
        { name: 'Organisationnel', description: 'Organisation de la sécurité' },
        { name: 'Gestion des risques', description: 'Processus de gestion des risques' },
        { name: 'Conformité', description: 'Aspects relatifs à la conformité' }
      ];
      
      console.log('Création de thématiques par défaut...');
      
      const createdThemes = [];
      for (const theme of defaultThemes) {
        const { data, error } = await supabase
          .from('audit_themes')
          .insert([theme])
          .select();
        
        if (!error && data && data.length > 0) {
          createdThemes.push(data[0]);
        }
      }
      
      console.log(`${createdThemes.length} thématiques par défaut créées`);
      return createdThemes;
    }
    
    console.log(`${themes.length} thématiques récupérées`);
    
    // Pour l'instant, nous retournons toutes les thématiques sans filtrer par framework
    // car l'association framework-thématique n'est pas encore implémentée
    return themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description || ''
    }));
  } catch (error) {
    console.error('Erreur complète lors de la récupération des thématiques:', error);
    return [];
  }
};

// Assurez-vous d'ajouter fetchThemesByFrameworkId dans les fonctions retournées par le hook
return {
  interviews,
  loading,
  fetchInterviews,
  fetchInterviewsByAuditId,
  addInterview,
  updateInterview,
  deleteInterview,
  addParticipant,
  removeParticipant,
  getParticipantsByInterviewId,
  generateAuditPlan,
  fetchThemesByFrameworkId,
};
};
