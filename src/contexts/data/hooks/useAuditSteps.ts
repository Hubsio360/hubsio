
import { useState } from 'react';
import { AuditStep } from '@/types';

export const useAuditSteps = () => {
  const [auditSteps, setAuditSteps] = useState<AuditStep[]>([]);

  const getAuditStepsByAuditId = (auditId: string): AuditStep[] => {
    return auditSteps
      .filter((step) => step.auditId === auditId)
      .sort((a, b) => a.order - b.order);
  };

  return {
    auditSteps,
    getAuditStepsByAuditId
  };
};
