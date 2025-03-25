
import { useState } from 'react';
import { AuditInterview, InterviewParticipant } from '@/types';
import { supabase, AuditInterviewRow, selectAuditInterviews } from '@/integrations/supabase/client';

export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);

  // Nouvelle fonction pour récupérer uniquement les interviews réelles de la base de données
  const fetchRealInterviewsFromDB = async (auditId: string): Promise<AuditInterview[]> => {
    if (!auditId || !isValidUUID(auditId)) {
      console.log('Invalid audit ID provided for fetchRealInterviewsFromDB');
      return [];
    }
    
    try {
      const { data, error } = await selectAuditInterviews()
        .eq('audit_id', auditId)
        .order('start_time');
      
      if (error) {
        console.error('Error fetching real audit interviews from DB:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(interview => ({
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
    } catch (error) {
      console.error('Error in fetchRealInterviewsFromDB:', error);
      return [];
    }
  };

  const fetchInterviewsByAuditId = async (auditId: string): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      console.log('Fetching interviews for audit:', auditId); // Debug log
      
      // Pour le développement ou si les appels à l'API échouent, utiliser des données locales
      if (!auditId || auditId.length === 0) {
        console.log('Invalid audit ID provided, returning empty array');
        setInterviews([]);
        return [];
      }
      
      try {
        // Try to fetch from the database first
        if (isValidUUID(auditId)) {
          // Using our custom typed function
          const { data, error } = await selectAuditInterviews()
            .eq('audit_id', auditId)
            .order('start_time');
          
          if (error) {
            console.error('Error fetching audit interviews from DB:', error);
            // Fall back to local data if DB query fails
            const localInterviews = generateLocalInterviews(auditId);
            setInterviews(localInterviews);
            return localInterviews;
          }
          
          console.log('Raw interview data:', data); // Debug log
          
          if (data && data.length > 0) {
            const formattedInterviews = data.map(interview => ({
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
            
            console.log('Formatted interviews:', formattedInterviews); // Debug log
            setInterviews(formattedInterviews);
            return formattedInterviews;
          }
        }
        
        // If we're here, either the UUID is invalid or no data was returned
        // Generate mock data for this specific audit
        const localInterviews = generateLocalInterviews(auditId);
        console.log('Generating local interviews for audit:', auditId, localInterviews);
        setInterviews(localInterviews);
        return localInterviews;
        
      } catch (fetchError) {
        console.error('Error in fetch operation:', fetchError);
        // Generate mock data as fallback
        const localInterviews = generateLocalInterviews(auditId);
        setInterviews(localInterviews);
        return localInterviews;
      }
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
      
      // Get the first row from the inserted data
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
      
      // Get the first row from the updated data
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
      console.log(`Generating audit plan for audit ID: ${auditId}`);
      if (!auditId) {
        console.error('No audit ID provided for plan generation');
        return false;
      }
      
      // Toujours générer des interviews locales pour les tests
      const localInterviews = generateLocalInterviews(auditId);
      
      // Tenter d'enregistrer en base de données si possible (UUID valide)
      if (isValidUUID(auditId)) {
        try {
          // Le code suivant s'exécute uniquement si auditId est un UUID valide
          // Récupérer les informations de l'audit
          const { data: auditData, error: auditError } = await supabase
            .from('audits')
            .select('framework_id')
            .eq('id', auditId)
            .single();
          
          if (auditError) {
            console.error('Error getting audit data, proceeding with local data:', auditError);
          } else {
            console.log('Retrieved audit data:', auditData);
            
            // Create db records for each local interview
            const interviewsToCreate = localInterviews.map(interview => ({
              audit_id: auditId,
              theme_id: interview.themeId,
              title: interview.title,
              description: interview.description,
              start_time: interview.startTime,
              duration_minutes: interview.durationMinutes,
              location: interview.location
            }));
            
            // Insérer les interviews générées
            if (interviewsToCreate.length > 0) {
              const { error: insertError } = await supabase
                .from('audit_interviews')
                .insert(interviewsToCreate);
              
              if (insertError) {
                console.error('Error creating audit interviews in DB:', insertError);
              } else {
                console.log('Successfully inserted interviews into DB');
              }
            }
          }
        } catch (dbError) {
          console.error('Database operation error, using local data instead:', dbError);
        }
      }
      
      // Mettre à jour l'état local avec les interviews générées
      setInterviews(localInterviews);
      return true;
    } catch (error) {
      console.error('Error generating audit plan:', error);
      return false;
    }
  };

  const generateLocalInterviews = (auditId: string): AuditInterview[] => {
    console.log(`Generating local interviews for audit ID: ${auditId}`);
    const start = new Date();
    const localInterviews = [];
    
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
      
      // Create a unique ID for this mock interview based on the auditId
      const uniqueId = `interview-${auditId.substring(0, 8)}-${i}`;
      
      const interview: AuditInterview = {
        id: uniqueId,
        auditId: auditId,
        themeId: theme.id,
        title: `Interview: ${theme.name}`,
        description: `Interview sur le thème: ${theme.name}`,
        startTime: interviewDate.toISOString(),
        durationMinutes: 60,
        location: 'À déterminer',
      };
      
      localInterviews.push(interview);
    }
    
    return localInterviews;
  };

  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
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
    generateAuditPlan
  };
};
