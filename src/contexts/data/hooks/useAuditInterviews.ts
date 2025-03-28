import { useState } from 'react';
import { AuditInterview, InterviewParticipant } from '@/types';

export const useAuditInterviews = () => {
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterviewsByAuditId = async (auditId: string): Promise<AuditInterview[]> => {
    setLoading(true);
    try {
      // Simulate API call to fetch interviews
      console.log(`Fetching interviews for audit ${auditId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter any existing interviews
      const auditInterviews = interviews.filter(i => i.auditId === auditId);
      return auditInterviews;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async (): Promise<AuditInterview[]> => {
    // Implementation for fetching all interviews
    return interviews;
  };

  // Add the missing hasPlanForAudit method
  const hasPlanForAudit = async (auditId: string): Promise<boolean> => {
    const auditInterviews = await fetchInterviewsByAuditId(auditId);
    return auditInterviews.length > 0;
  };

  const addInterview = async (interview: Omit<AuditInterview, 'id'>): Promise<AuditInterview | null> => {
    try {
      const newInterview: AuditInterview = {
        ...interview,
        id: `interview-${Date.now()}`
      };
      setInterviews(prev => [...prev, newInterview]);
      return newInterview;
    } catch (error) {
      console.error('Error adding interview:', error);
      return null;
    }
  };

  const updateInterview = async (id: string, updates: Partial<AuditInterview>): Promise<AuditInterview | null> => {
    try {
      const interviewIndex = interviews.findIndex(i => i.id === id);
      if (interviewIndex === -1) {
        return null;
      }

      const updatedInterview = { ...interviews[interviewIndex], ...updates };
      const newInterviews = [...interviews];
      newInterviews[interviewIndex] = updatedInterview;
      setInterviews(newInterviews);
      return updatedInterview;
    } catch (error) {
      console.error('Error updating interview:', error);
      return null;
    }
  };

  const deleteInterview = async (id: string): Promise<boolean> => {
    try {
      setInterviews(prev => prev.filter(i => i.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting interview:', error);
      return false;
    }
  };
  
  const addParticipant = async (participant: Omit<InterviewParticipant, 'notificationSent'>): Promise<boolean> => {
    // Implementation for adding participant
    return true;
  };
  
  const removeParticipant = async (interviewId: string, userId: string): Promise<boolean> => {
    // Implementation for removing participant
    return true;
  };
  
  const getParticipantsByInterviewId = async (interviewId: string): Promise<InterviewParticipant[]> => {
    // Implementation for getting participants
    return [];
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
    // Implementation for generating audit plan
    return true;
  };

  // Add the missing importStandardAuditPlan method
  const importStandardAuditPlan = async (
    auditId: string, 
    planData: any[], 
    customThemes?: any[]
  ): Promise<boolean> => {
    // Implementation for importing standard audit plan
    console.log(`Importing standard audit plan for audit ${auditId}`);
    return true;
  };

  const fetchThemesByFrameworkId = async (frameworkId: string): Promise<any[]> => {
    // Implementation for fetching themes by framework ID
    return [];
  };

  return {
    interviews,
    loading,
    fetchInterviews,
    fetchInterviewsByAuditId,
    hasPlanForAudit,
    addInterview,
    updateInterview,
    deleteInterview,
    addParticipant,
    removeParticipant,
    getParticipantsByInterviewId,
    generateAuditPlan,
    importStandardAuditPlan,
    fetchThemesByFrameworkId
  };
};
