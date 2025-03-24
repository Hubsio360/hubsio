
import React, { createContext, useContext, ReactNode } from 'react';
import { useCompanies } from './hooks/useCompanies';
import { useAudits } from './hooks/useAudits';
import { useFrameworks } from './hooks/useFrameworks';
import { useControls } from './hooks/useControls';
import { useAuditSteps } from './hooks/useAuditSteps';
import { useFindings } from './hooks/useFindings';
import { 
  Company, 
  Audit, 
  Framework, 
  FrameworkControl, 
  AuditStep,
  Finding,
  FrameworkImport,
  FrameworkImportResult
} from '@/types';

interface DataContextProps {
  companies: Company[];
  audits: Audit[];
  frameworks: Framework[];
  controls: FrameworkControl[];
  auditSteps: AuditStep[];
  findings: Finding[];
  loading: {
    frameworks: boolean;
    controls: boolean;
  };
  addCompany: (company: Omit<Company, 'id'>) => Promise<Company>;
  addAudit: (audit: Omit<Audit, 'id'>) => Promise<Audit>;
  addFinding: (finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Finding>;
  updateFinding: (id: string, updates: Partial<Finding>) => Promise<Finding>;
  enrichCompanyData: (companyId: string) => Promise<Company>;
  getAuditsByCompanyId: (companyId: string) => Audit[];
  getFindingsByAuditStepId: (auditStepId: string) => Finding[];
  getAuditStepsByAuditId: (auditId: string) => AuditStep[];
  getCompanyById: (id: string) => Company | undefined;
  getAuditById: (id: string) => Audit | undefined;
  getFrameworkById: (id: string) => Framework | undefined;
  getControlById: (id: string) => FrameworkControl | undefined;
  importFramework: (frameworkData: FrameworkImport) => Promise<FrameworkImportResult>;
  updateFramework: (id: string, updates: Partial<Framework>) => Promise<Framework>;
  deleteFramework: (id: string) => Promise<void>;
  updateControl: (id: string, updates: Partial<FrameworkControl>) => Promise<FrameworkControl>;
  addControl: (control: Omit<FrameworkControl, 'id'>) => Promise<FrameworkControl>;
  refreshFrameworks: () => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const companiesHook = useCompanies();
  const auditsHook = useAudits();
  const frameworksHook = useFrameworks();
  const controlsHook = useControls();
  const auditStepsHook = useAuditSteps();
  const findingsHook = useFindings();

  const loading = {
    frameworks: frameworksHook.loading,
    controls: controlsHook.loading
  };

  const refreshFrameworks = async () => {
    await frameworksHook.fetchFrameworks();
    await controlsHook.fetchControls();
  };

  return (
    <DataContext.Provider
      value={{
        companies: companiesHook.companies,
        audits: auditsHook.audits,
        frameworks: frameworksHook.frameworks,
        controls: controlsHook.controls,
        auditSteps: auditStepsHook.auditSteps,
        findings: findingsHook.findings,
        loading,
        addCompany: companiesHook.addCompany,
        addAudit: auditsHook.addAudit,
        addFinding: findingsHook.addFinding,
        updateFinding: findingsHook.updateFinding,
        enrichCompanyData: companiesHook.enrichCompanyData,
        getAuditsByCompanyId: auditsHook.getAuditsByCompanyId,
        getFindingsByAuditStepId: findingsHook.getFindingsByAuditStepId,
        getAuditStepsByAuditId: auditStepsHook.getAuditStepsByAuditId,
        getCompanyById: companiesHook.getCompanyById,
        getAuditById: auditsHook.getAuditById,
        getFrameworkById: frameworksHook.getFrameworkById,
        getControlById: controlsHook.getControlById,
        importFramework: frameworksHook.importFramework,
        updateFramework: frameworksHook.updateFramework,
        deleteFramework: frameworksHook.deleteFramework,
        updateControl: controlsHook.updateControl,
        addControl: controlsHook.addControl,
        refreshFrameworks
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
