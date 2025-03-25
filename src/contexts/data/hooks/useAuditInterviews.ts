
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

/**
 * Hook pour gérer les entretiens d'audit
 */
export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);

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
        // Après la création réussie en DB, rafraîchir l'état des entretiens
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
    hasPlanForAudit
  };
};
