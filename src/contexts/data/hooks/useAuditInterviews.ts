
import { useState } from 'react';
import { AuditInterview, InterviewParticipant } from '@/types';
import { supabase, selectAuditInterviews } from '@/integrations/supabase/client';

export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterviewsByAuditId = async (auditId: string): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      // Vérifier si c'est un UUID valide avant d'interroger la base de données
      // Si ce n'est pas un UUID, on retourne un tableau vide simulé pour le développement
      if (!isValidUUID(auditId)) {
        console.log(`ID d'audit non valide pour UUID: ${auditId}, simulation de données vides`);
        setInterviews([]);
        return [];
      }
      
      // Using our custom typed function
      const { data, error } = await selectAuditInterviews()
        .eq('audit_id', auditId)
        .order('start_time');
      
      if (error) {
        console.error('Error fetching audit interviews:', error);
        return [];
      }
      
      const formattedInterviews = (data || []).map(interview => ({
        id: interview.id,
        auditId: interview.audit_id,
        topicId: interview.topic_id,
        themeId: interview.theme_id || undefined,
        title: interview.title,
        description: interview.description,
        startTime: interview.start_time,
        durationMinutes: interview.duration_minutes,
        location: interview.location,
        meetingLink: interview.meeting_link,
        controlRefs: interview.control_refs || undefined
      }));
      
      setInterviews(formattedInterviews);
      return formattedInterviews;
    } catch (error) {
      console.error('Error fetching audit interviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addInterview = async (interview: Omit<AuditInterview, 'id'>): Promise<AuditInterview | null> => {
    try {
      const { data, error } = await supabase
        .from('audit_interviews')
        .insert([{
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
        }])
        .select();
      
      if (error) {
        console.error('Error adding audit interview:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned after inserting interview');
        return null;
      }
      
      // Safely cast the returned data
      const insertedRecord = data[0] as AuditInterviewRow;
      
      const newInterview: AuditInterview = {
        id: insertedRecord.id,
        auditId: insertedRecord.audit_id,
        topicId: insertedRecord.topic_id,
        themeId: insertedRecord.theme_id || undefined,
        title: insertedRecord.title,
        description: insertedRecord.description,
        startTime: insertedRecord.start_time,
        durationMinutes: insertedRecord.duration_minutes,
        location: insertedRecord.location,
        meetingLink: insertedRecord.meeting_link,
        controlRefs: insertedRecord.control_refs || undefined
      };
      
      setInterviews((prev) => [...prev, newInterview]);
      return newInterview;
    } catch (error) {
      console.error('Error adding audit interview:', error);
      return null;
    }
  };

  const updateInterview = async (
    id: string,
    updates: Partial<AuditInterview>
  ): Promise<AuditInterview | null> => {
    try {
      const updateData: any = {};
      
      if (updates.auditId) updateData.audit_id = updates.auditId;
      if (updates.topicId) updateData.topic_id = updates.topicId;
      if (updates.themeId !== undefined) updateData.theme_id = updates.themeId;
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.durationMinutes) updateData.duration_minutes = updates.durationMinutes;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink;
      if (updates.controlRefs !== undefined) updateData.control_refs = updates.controlRefs;
      
      const { data, error } = await supabase
        .from('audit_interviews')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating audit interview:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned after updating interview');
        return null;
      }
      
      // Safely cast the returned data
      const updatedRecord = data[0] as AuditInterviewRow;
      
      const updatedInterview: AuditInterview = {
        id: updatedRecord.id,
        auditId: updatedRecord.audit_id,
        topicId: updatedRecord.topic_id,
        themeId: updatedRecord.theme_id || undefined,
        title: updatedRecord.title,
        description: updatedRecord.description,
        startTime: updatedRecord.start_time,
        durationMinutes: updatedRecord.duration_minutes,
        location: updatedRecord.location,
        meetingLink: updatedRecord.meeting_link,
        controlRefs: updatedRecord.control_refs || undefined
      };
      
      setInterviews((prev) =>
        prev.map((interview) => (interview.id === id ? updatedInterview : interview))
      );
      
      return updatedInterview;
    } catch (error) {
      console.error('Error updating audit interview:', error);
      return null;
    }
  };

  const deleteInterview = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_interviews')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting audit interview:', error);
        return false;
      }
      
      setInterviews((prev) => prev.filter((interview) => interview.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting audit interview:', error);
      return false;
    }
  };

  const addParticipant = async (participant: Omit<InterviewParticipant, 'notificationSent'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('interview_participants')
        .insert([{
          interview_id: participant.interviewId,
          user_id: participant.userId,
          role: participant.role,
          notification_sent: false
        }]);
      
      if (error) {
        console.error('Error adding interview participant:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding interview participant:', error);
      return false;
    }
  };

  const removeParticipant = async (interviewId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('interview_participants')
        .delete()
        .eq('interview_id', interviewId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error removing interview participant:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error removing interview participant:', error);
      return false;
    }
  };

  const getParticipantsByInterviewId = async (interviewId: string): Promise<InterviewParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from('interview_participants')
        .select('*')
        .eq('interview_id', interviewId);
      
      if (error) {
        console.error('Error getting participants by interview ID:', error);
        return [];
      }
      
      return data.map(p => ({
        interviewId: p.interview_id,
        userId: p.user_id,
        role: p.role,
        notificationSent: p.notification_sent
      }));
    } catch (error) {
      console.error('Error getting participants by interview ID:', error);
      return [];
    }
  };

  const generateAuditPlan = async (auditId: string, startDate: string, endDate: string): Promise<boolean> => {
    try {
      // Vérifier si c'est un UUID valide avant d'interroger la base de données
      // Pour le développement, nous allons générer un plan local si ce n'est pas un UUID valide
      if (!isValidUUID(auditId)) {
        console.log(`ID d'audit non valide pour UUID: ${auditId}, génération d'un plan local`);
        
        // Générer quelques interviews de test directement dans l'état local
        const start = new Date(startDate);
        const interviewsToCreate = [];
        
        // Créer quelques interviews factices pour la génération locale
        const testThemes = [
          { id: 'theme-1', name: 'ADMIN' },
          { id: 'theme-2', name: 'Exploitation & réseaux' },
          { id: 'theme-5', name: 'Sécurité des ressources humaines' },
          { id: 'theme-12', name: 'Cloture' }
        ];
        
        for (let i = 0; i < testThemes.length; i++) {
          const theme = testThemes[i];
          const interviewDate = new Date(start);
          interviewDate.setDate(start.getDate() + Math.floor(i / 2));
          
          // Distribuer les interviews dans la journée (9h-17h)
          const hourOffset = (i % 2) * 3; // 3 heures par interview
          interviewDate.setHours(9 + hourOffset, 0, 0, 0);
          
          const interview: AuditInterview = {
            id: `interview-${Date.now()}-${i}`,
            auditId: auditId,
            themeId: theme.id,
            title: `Interview: ${theme.name}`,
            description: `Interview sur le thème: ${theme.name}`,
            startTime: interviewDate.toISOString(),
            durationMinutes: 60,
            location: 'À déterminer',
          };
          
          interviewsToCreate.push(interview);
        }
        
        // Mettre à jour l'état local avec les interviews générées
        setInterviews(interviewsToCreate);
        return true;
      }
      
      // Le code suivant s'exécute uniquement si auditId est un UUID valide
      // Récupérer les informations de l'audit
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('framework_id')
        .eq('id', auditId)
        .single();
      
      if (auditError) {
        console.error('Error getting audit data:', auditError);
        return false;
      }
      
      // Récupérer les topics disponibles
      const { data: topicsData, error: topicsError } = await supabase
        .from('audit_topics')
        .select('*');
        
      if (topicsError) {
        console.error('Error getting audit topics:', topicsError);
        return false;
      }
      
      if (!topicsData || topicsData.length === 0) {
        console.error('No audit topics available for planning');
        return false;
      }
      
      // Calculer le nombre de jours entre les dates de début et de fin
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Distribution des topics sur les jours disponibles
      const interviewsToCreate = [];
      const topicsPerDay = Math.max(1, Math.ceil(topicsData.length / diffDays));
      
      for (let i = 0; i < topicsData.length; i++) {
        const topic = topicsData[i];
        const dayIndex = Math.floor(i / topicsPerDay);
        
        if (dayIndex >= diffDays) break;
        
        const interviewDate = new Date(start);
        interviewDate.setDate(start.getDate() + dayIndex);
        
        // Distribuer les interviews dans la journée (9h-17h)
        const hourOffset = (i % topicsPerDay) * 2; // 2 heures par interview
        interviewDate.setHours(9 + hourOffset, 0, 0, 0);
        
        interviewsToCreate.push({
          audit_id: auditId,
          topic_id: topic.id,
          title: `Interview: ${topic.name}`,
          description: topic.description || `Interview sur le thème: ${topic.name}`,
          start_time: interviewDate.toISOString(),
          duration_minutes: 60,
          location: 'À déterminer',
          meeting_link: null
        });
      }
      
      // Insérer les interviews générées
      if (interviewsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('audit_interviews')
          .insert(interviewsToCreate);
        
        if (insertError) {
          console.error('Error creating audit interviews:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error generating audit plan:', error);
      return false;
    }
  };

  // Fonction utilitaire pour vérifier si une chaîne est un UUID valide
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  return {
    interviews,
    loading,
    fetchInterviewsByAuditId,
    addInterview,
    updateInterview,
    deleteInterview,
    addParticipant,
    removeParticipant,
    getParticipantsByInterviewId,
    generateAuditPlan
  };
};
