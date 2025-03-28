import { useState } from 'react';
import { AuditInterview, InterviewParticipant } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { fetchInterviewsFromDB, createInterviewsInDB, deleteExistingInterviews } from '../utils/interviewDbOps';

export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterviews = async (): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_interviews')
        .select('*')
        .order('start_time');
      
      if (error) {
        console.error('Error fetching audit interviews:', error);
        return [];
      }
      
      const fetchedInterviews = (data || []).map(interview => ({
        id: interview.id,
        auditId: interview.audit_id || '',
        topicId: interview.topic_id || '',
        themeId: interview.theme_id || '',
        title: interview.title,
        description: interview.description || '',
        startTime: interview.start_time,
        durationMinutes: interview.duration_minutes,
        location: interview.location || '',
        meetingLink: interview.meeting_link || '',
        controlRefs: interview.control_refs || ''
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
        .eq('audit_id', auditId)
        .order('start_time');
      
      if (error) {
        console.error('Error fetching audit interviews:', error);
        return [];
      }
      
      const fetchedInterviews = (data || []).map(interview => ({
        id: interview.id,
        auditId: interview.audit_id || '',
        topicId: interview.topic_id || '',
        themeId: interview.theme_id || '',
        title: interview.title,
        description: interview.description || '',
        startTime: interview.start_time,
        durationMinutes: interview.duration_minutes,
        location: interview.location || '',
        meetingLink: interview.meeting_link || '',
        controlRefs: interview.control_refs || ''
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
      console.log(`[useAuditInterviews] Fetching audit interviews for audit ID: ${auditId}`);
      if (!auditId) {
        console.error('[useAuditInterviews] No audit ID provided');
        return [];
      }
      
      // Utiliser la fonction dédiée pour récupérer les interviews depuis la base de données
      const interviews = await fetchInterviewsFromDB(auditId);
      
      if (interviews.length === 0) {
        console.log('[useAuditInterviews] No interviews found for this audit');
      } else {
        console.log(`[useAuditInterviews] Found ${interviews.length} interviews`);
      }
      
      // Mise à jour de l'état local
      setInterviews(interviews);
      return interviews;
    } catch (error) {
      console.error('[useAuditInterviews] Error fetching audit interviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addInterview = async (interview: Omit<AuditInterview, 'id'>): Promise<AuditInterview | null> => {
    try {
      console.log("Adding new audit interview:", interview);
      
      // Convert from our app's camelCase to database snake_case
      const dbInterview = {
        audit_id: interview.auditId,
        topic_id: interview.topicId,
        theme_id: interview.themeId,
        title: interview.title,
        description: interview.description,
        start_time: interview.startTime,
        duration_minutes: interview.durationMinutes,
        location: interview.location,
        meeting_link: interview.meetingLink,
        control_refs: interview.controlRefs
      };
      
      const { data, error } = await supabase
        .from('audit_interviews')
        .insert([dbInterview])
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
        auditId: data[0].audit_id || '',
        topicId: data[0].topic_id || '',
        themeId: data[0].theme_id || '',
        title: data[0].title,
        description: data[0].description || '',
        startTime: data[0].start_time,
        durationMinutes: data[0].duration_minutes,
        location: data[0].location || '',
        meetingLink: data[0].meeting_link || '',
        controlRefs: data[0].control_refs || ''
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
      
      // Convert camelCase properties to snake_case for database
      const dbUpdates: any = {};
      if (updates.auditId !== undefined) dbUpdates.audit_id = updates.auditId;
      if (updates.topicId !== undefined) dbUpdates.topic_id = updates.topicId;
      if (updates.themeId !== undefined) dbUpdates.theme_id = updates.themeId;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.durationMinutes !== undefined) dbUpdates.duration_minutes = updates.durationMinutes;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.meetingLink !== undefined) dbUpdates.meeting_link = updates.meetingLink;
      if (updates.controlRefs !== undefined) dbUpdates.control_refs = updates.controlRefs;
      
      const { data, error } = await supabase
        .from('audit_interviews')
        .update(dbUpdates)
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
        auditId: data[0].audit_id || '',
        topicId: data[0].topic_id || '',
        themeId: data[0].theme_id || '',
        title: data[0].title,
        description: data[0].description || '',
        startTime: data[0].start_time,
        durationMinutes: data[0].duration_minutes,
        location: data[0].location || '',
        meetingLink: data[0].meeting_link || '',
        controlRefs: data[0].control_refs || ''
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

  const addParticipant = async (participant: Omit<InterviewParticipant, 'notificationSent'>): Promise<boolean> => {
    try {
      console.log(`Adding participant to interview ${participant.interviewId}`);
      
      // Convert camelCase to snake_case for database
      const dbParticipant = {
        interview_id: participant.interviewId,
        user_id: participant.userId,
        role: participant.role,
        notification_sent: false
      };
      
      const { error } = await supabase
        .from('interview_participants')
        .insert([dbParticipant]);
      
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
        .eq('interview_id', interviewId)
        .eq('user_id', userId);
      
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

  const getParticipantsByInterviewId = async (interviewId: string): Promise<InterviewParticipant[]> => {
    try {
      console.log(`Fetching participants for interview ${interviewId}`);
      
      const { data, error } = await supabase
        .from('interview_participants')
        .select('*')
        .eq('interview_id', interviewId);
      
      if (error) {
        console.error('Error fetching participants:', error);
        return [];
      }
      
      console.log(`Found ${data?.length || 0} participants`);
      
      return (data || []).map(participant => ({
        interviewId: participant.interview_id,
        userId: participant.user_id,
        role: participant.role,
        notificationSent: participant.notification_sent
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
    console.log("[useAuditInterviews] Generating audit plan with options:", { auditId, startDate, endDate, options });
    
    if (!auditId) {
      console.error("[useAuditInterviews] No audit ID provided for plan generation");
      return false;
    }
    
    try {
      // Importer la fonction generatePlanSchedule directement depuis le fichier d'utilitaires
      const { generatePlanSchedule } = await import('../utils/interviewPlanGenerator');
      
      console.log("[useAuditInterviews] Appel direct à generatePlanSchedule avec les options:", options);
      
      // Appel direct à la fonction de génération du plan
      const result = await generatePlanSchedule(auditId, startDate, endDate, options);
      
      console.log("[useAuditInterviews] Résultat de generatePlanSchedule:", result);
      
      if (result) {
        console.log("[useAuditInterviews] Successfully generated audit plan");
        return true;
      } else {
        console.error("[useAuditInterviews] Failed to generate plan schedule");
        return false;
      }
    } catch (error) {
      console.error("[useAuditInterviews] Error generating audit plan:", error);
      return false;
    }
  };

  const fetchThemesByFrameworkId = async (frameworkId: string): Promise<{ id: string, name: string, description: string }[]> => {
    console.log(`Beginning fetchThemesByFrameworkId for framework: ${frameworkId}`);
    
    try {
      // First, try to retrieve all available themes
      const { data: themes, error: themesError } = await supabase
        .from('audit_themes')
        .select('*')
        .order('name');
      
      if (themesError) {
        console.error('Error fetching themes:', themesError);
        throw new Error('Error fetching themes');
      }
      
      if (!themes || themes.length === 0) {
        console.error('No themes available in the database');
        
        // If no themes exist, create some default ones
        const defaultThemes = [
          { name: 'Governance', description: 'Themes related to security governance' },
          { name: 'Technical', description: 'Technical aspects of information security' },
          { name: 'Organizational', description: 'Security organization' },
          { name: 'Risk Management', description: 'Risk management processes' },
          { name: 'Compliance', description: 'Compliance-related aspects' }
        ];
        
        console.log('Creating default themes...');
        
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
        
        console.log(`${createdThemes.length} default themes created`);
        return createdThemes.map(theme => ({
          id: theme.id,
          name: theme.name,
          description: theme.description || ''
        }));
      }
      
      console.log(`${themes.length} themes retrieved`);
      
      // For now, we return all themes without filtering by framework
      // as the framework-theme association is not yet implemented
      return themes.map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description || ''
      }));
    } catch (error) {
      console.error('Complete error fetching themes:', error);
      return [];
    }
  };

  return {
    interviews,
    loading,
    fetchInterviews,
    fetchInterviewsByAuditId,
    fetchRealInterviewsFromDB: fetchInterviewsFromDB,
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
