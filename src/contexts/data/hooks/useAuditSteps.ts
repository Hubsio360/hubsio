
import { useState, useCallback } from 'react';
import { AuditStep } from '@/types';

export const useAuditSteps = () => {
  const [auditSteps, setAuditSteps] = useState<AuditStep[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuditStepsByAuditId = useCallback((auditId: string): AuditStep[] => {
    return auditSteps
      .filter((step) => step.auditId === auditId)
      .sort((a, b) => a.order - b.order);
  }, [auditSteps]);

  const fetchAuditSteps = useCallback(async (auditId: string): Promise<AuditStep[]> => {
    setLoading(true);
    try {
      // Ici vous pourriez ajouter une vraie requête à Supabase si nécessaire
      // Pour l'instant nous retournons simplement les étapes existantes
      return getAuditStepsByAuditId(auditId);
    } catch (error) {
      console.error('Error fetching audit steps:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getAuditStepsByAuditId]);

  return {
    auditSteps,
    loading,
    getAuditStepsByAuditId,
    fetchAuditSteps
  };
};
