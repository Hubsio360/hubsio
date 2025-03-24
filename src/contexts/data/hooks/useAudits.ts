
import { useState } from 'react';
import { Audit } from '@/types';

export const useAudits = () => {
  const [audits, setAudits] = useState<Audit[]>([]);

  const addAudit = async (audit: Omit<Audit, 'id'>): Promise<Audit> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAudit = {
          ...audit,
          id: `audit-${Date.now()}`,
        };
        setAudits((prev) => [...prev, newAudit]);
        resolve(newAudit);
      }, 500);
    });
  };

  const getAuditsByCompanyId = (companyId: string): Audit[] => {
    return audits.filter((audit) => audit.companyId === companyId);
  };

  const getAuditById = (id: string): Audit | undefined => {
    return audits.find((audit) => audit.id === id);
  };

  const deleteAudit = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setAudits((prev) => prev.filter(audit => audit.id !== id));
        resolve(true);
      }, 500);
    });
  };

  return {
    audits,
    addAudit,
    getAuditsByCompanyId,
    getAuditById,
    deleteAudit
  };
};
