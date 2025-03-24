import React, { createContext, useContext, ReactNode } from 'react';
import { useCompanies } from './hooks/useCompanies';
import { useAudits } from './hooks/useAudits';
import { useFrameworks } from './hooks/useFrameworks';
import { useControls } from './hooks/useControls';
import { useAuditSteps } from './hooks/useAuditSteps';
import { useFindings } from './hooks/useFindings';
import { useAuditTopics } from './hooks/useAuditTopics';
import { useAuditInterviews } from './hooks/useAuditInterviews';
import { 
  Company, 
  Audit, 
  Framework, 
  FrameworkControl, 
  AuditStep,
  Finding,
  FrameworkImport,
  FrameworkImportResult,
  AuditTopic,
  AuditInterview,
  InterviewParticipant
} from '@/types';

interface DataContextProps {
  companies: Company[];
  audits: Audit[];
  frameworks: Framework[];
  controls: FrameworkControl[];
  auditSteps: AuditStep[];
  findings: Finding[];
  topics: AuditTopic[];
  interviews: AuditInterview[];
  loading: {
    frameworks: boolean;
    controls: boolean;
    topics: boolean;
    interviews: boolean;
  };
  addCompany: (company: Omit<Company, 'id'>) => Promise<Company>;
  addAudit: (audit: Omit<Audit, 'id'>) => Promise<Audit>;
  deleteAudit: (id: string) => Promise<boolean>;
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
  
  assignAuditors: (auditId: string, auditorIds: { userId: string, roleInAudit: 'lead' | 'participant' }[]) => Promise<boolean>;
  getAuditAuditors: (auditId: string) => Promise<{ userId: string, roleInAudit: 'lead' | 'participant' }[]>;
  
  fetchTopics: () => Promise<AuditTopic[]>;
  addTopic: (topic: Omit<AuditTopic, 'id'>) => Promise<AuditTopic | null>;
  updateTopic: (id: string, updates: Partial<AuditTopic>) => Promise<AuditTopic | null>;
  deleteTopic: (id: string) => Promise<boolean>;
  associateControlsWithTopic: (topicId: string, controlIds: string[]) => Promise<boolean>;
  getControlsByTopicId: (topicId: string) => Promise<string[]>;
  
  fetchInterviewsByAuditId: (auditId: string) => Promise<AuditInterview[]>;
  addInterview: (interview: Omit<AuditInterview, 'id'>) => Promise<AuditInterview | null>;
  updateInterview: (id: string, updates: Partial<AuditInterview>) => Promise<AuditInterview | null>;
  deleteInterview: (id: string) => Promise<boolean>;
  addParticipant: (participant: Omit<InterviewParticipant, 'notificationSent'>) => Promise<boolean>;
  removeParticipant: (interviewId: string, userId: string) => Promise<boolean>;
  getParticipantsByInterviewId: (interviewId: string) => Promise<InterviewParticipant[]>;
  generateAuditPlan: (auditId: string, startDate: string, endDate: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const companiesHook = useCompanies();
  const auditsHook = useAudits();
  const frameworksHook = useFrameworks();
  const controlsHook = useControls();
  const auditStepsHook = useAuditSteps();
  const findingsHook = useFindings();
  const auditTopicsHook = useAuditTopics();
  const auditInterviewsHook = useAuditInterviews();

  const loading = {
    frameworks: frameworksHook.loading,
    controls: controlsHook.loading,
    topics: auditTopicsHook.loading,
    interviews: auditInterviewsHook.loading
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
        topics: auditTopicsHook.topics,
        interviews: auditInterviewsHook.interviews,
        loading,
        addCompany: companiesHook.addCompany,
        addAudit: auditsHook.addAudit,
        deleteAudit: auditsHook.deleteAudit,
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
        refreshFrameworks,
        
        assignAuditors: auditsHook.assignAuditors,
        getAuditAuditors: auditsHook.getAuditAuditors,
        
        fetchTopics: auditTopicsHook.fetchTopics,
        addTopic: auditTopicsHook.addTopic,
        updateTopic: auditTopicsHook.updateTopic,
        deleteTopic: auditTopicsHook.deleteTopic,
        associateControlsWithTopic: auditTopicsHook.associateControlsWithTopic,
        getControlsByTopicId: auditTopicsHook.getControlsByTopicId,
        
        fetchInterviewsByAuditId: auditInterviewsHook.fetchInterviewsByAuditId,
        addInterview: auditInterviewsHook.addInterview,
        updateInterview: auditInterviewsHook.updateInterview,
        deleteInterview: auditInterviewsHook.deleteInterview,
        addParticipant: auditInterviewsHook.addParticipant,
        removeParticipant: auditInterviewsHook.removeParticipant,
        getParticipantsByInterviewId: auditInterviewsHook.getParticipantsByInterviewId,
        generateAuditPlan: auditInterviewsHook.generateAuditPlan
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
