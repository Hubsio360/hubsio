
import { useState } from 'react';
import { Finding } from '@/types';

export const useFindings = () => {
  const [findings, setFindings] = useState<Finding[]>([]);

  const addFinding = async (
    finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Finding> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString();
        const newFinding = {
          ...finding,
          id: `finding-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        setFindings((prev) => [...prev, newFinding]);
        resolve(newFinding);
      }, 500);
    });
  };

  const updateFinding = async (
    id: string,
    updates: Partial<Finding>
  ): Promise<Finding> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const findingIndex = findings.findIndex((f) => f.id === id);
        if (findingIndex === -1) {
          return reject(new Error('Finding not found'));
        }

        const updatedFinding = {
          ...findings[findingIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const newFindings = [...findings];
        newFindings[findingIndex] = updatedFinding;
        setFindings(newFindings);
        resolve(updatedFinding);
      }, 500);
    });
  };

  const getFindingsByAuditStepId = (auditStepId: string): Finding[] => {
    return findings.filter((finding) => finding.auditStepId === auditStepId);
  };

  return {
    findings,
    addFinding,
    updateFinding,
    getFindingsByAuditStepId
  };
};
