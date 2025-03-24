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
  AuditTheme,
  AuditInterview,
  InterviewParticipant,
  StandardClause
} from '@/types';

interface DataContextProps {
  companies: Company[];
  audits: Audit[];
  frameworks: Framework[];
  controls: FrameworkControl[];
  auditSteps: AuditStep[];
  findings: Finding[];
  topics: AuditTopic[];
  themes: AuditTheme[];
  interviews: AuditInterview[];
  standardClauses: StandardClause[];
  loading: {
    frameworks: boolean;
    controls: boolean;
    topics: boolean;
    interviews: boolean;
    themes: boolean;
    standardClauses: boolean;
    audits: boolean;
  };
  addCompany: (company: Omit<Company, 'id'>) => Promise<Company>;
  addAudit: (audit: Omit<Audit, 'id'>) => Promise<Audit>;
  updateAudit: (id: string, updates: Partial<Audit>) => Promise<Audit>;
  deleteAudit: (id: string) => Promise<boolean>;
  fetchAudits: () => Promise<void>;
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
  fetchThemes: () => Promise<AuditTheme[]>;
  fetchStandardClauses: () => Promise<StandardClause[]>;
  addTopic: (topic: Omit<AuditTopic, 'id'>) => Promise<AuditTopic | null>;
  addTheme: (theme: Omit<AuditTheme, 'id'>) => Promise<AuditTheme | null>;
  updateTopic: (id: string, updates: Partial<AuditTopic>) => Promise<AuditTopic | null>;
  updateTheme: (id: string, updates: Partial<AuditTheme>) => Promise<AuditTheme | null>;
  deleteTopic: (id: string) => Promise<boolean>;
  deleteTheme: (id: string) => Promise<boolean>;
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
  importStandardAuditPlan: (auditId: string, planData: any[]) => Promise<boolean>;
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

  const themes: AuditTheme[] = [
    { id: 'theme-1', name: 'ADMIN', description: 'Gestion administrative de l\'audit' },
    { id: 'theme-2', name: 'Exploitation & réseaux', description: 'Sécurité des infrastructures réseau et exploitation' },
    { id: 'theme-3', name: 'Gestion des identité accès logiques', description: 'Contrôle des accès et authentification' },
    { id: 'theme-4', name: 'Gestion des actifs', description: 'Inventaire et classification des actifs' },
    { id: 'theme-5', name: 'Sécurité des ressources humaines', description: 'Processus RH liés à la sécurité' },
    { id: 'theme-6', name: 'Sécurité physique', description: 'Protection physique des installations' },
    { id: 'theme-7', name: 'Conformité aux lois', description: 'Respect des exigences légales et réglementaires' },
    { id: 'theme-8', name: 'Gestion des fournisseurs', description: 'Relations avec les prestataires et fournisseurs' },
    { id: 'theme-9', name: 'Développement', description: 'Sécurité du cycle de développement logiciel' },
    { id: 'theme-10', name: 'Gestion des incidents de sécurité', description: 'Réponse et gestion des incidents' },
    { id: 'theme-11', name: 'Continuité d\'activité', description: 'Plan de continuité et reprise d\'activité' },
    { id: 'theme-12', name: 'Cloture', description: 'Clôture de l\'audit' }
  ];

  const standardClauses: StandardClause[] = [
    { id: 'clause-1', referenceCode: 'A.8.15', title: 'Sécurité des communications', standardId: 'ISO27001:2022' },
    { id: 'clause-2', referenceCode: 'A.8.16', title: 'Transfert d\'informations', standardId: 'ISO27001:2022' },
    { id: 'clause-3', referenceCode: 'A.8.17', title: 'Séparation des réseaux', standardId: 'ISO27001:2022' },
  ];

  const loading = {
    frameworks: frameworksHook.loading,
    controls: controlsHook.loading,
    topics: auditTopicsHook.loading,
    interviews: auditInterviewsHook.loading,
    themes: false,
    standardClauses: false,
    audits: auditsHook.loading
  };

  const refreshFrameworks = async () => {
    await frameworksHook.fetchFrameworks();
    await controlsHook.fetchControls();
  };

  const fetchThemes = async (): Promise<AuditTheme[]> => {
    return themes;
  };

  const fetchStandardClauses = async (): Promise<StandardClause[]> => {
    return standardClauses;
  };

  const addTheme = async (theme: Omit<AuditTheme, 'id'>): Promise<AuditTheme | null> => {
    console.log('Ajout d\'une thématique:', theme);
    return { id: `theme-${Date.now()}`, ...theme };
  };

  const updateTheme = async (id: string, updates: Partial<AuditTheme>): Promise<AuditTheme | null> => {
    console.log('Mise à jour de la thématique:', id, updates);
    return { id, name: updates.name || 'Theme name', description: updates.description };
  };

  const deleteTheme = async (id: string): Promise<boolean> => {
    console.log('Suppression de la thématique:', id);
    return true;
  };

  const importStandardAuditPlan = async (auditId: string, planData: any[]): Promise<boolean> => {
    try {
      const themeInterviews = planData.reduce((acc: Record<string, any[]>, item) => {
        const theme = item['Thème'] || 'Sans thème';
        if (!acc[theme]) {
          acc[theme] = [];
        }
        acc[theme].push(item);
        return acc;
      }, {});

      for (const [themeName, interviews] of Object.entries(themeInterviews) as [string, any[]][]) {
        let themeId = themes.find(t => t.name === themeName)?.id;
        
        if (!themeId) {
          const newTheme = await addTheme({ name: themeName });
          themeId = newTheme?.id;
        }

        for (const interview of interviews) {
          const dateTimeParts = interview['Date-Heure'].split(' → ');
          const startDateTime = new Date(dateTimeParts[0]);
          
          let durationMinutes = 30;
          if (dateTimeParts.length > 1) {
            const endTime = new Date(dateTimeParts[1]);
            durationMinutes = Math.round((endTime.getTime() - startDateTime.getTime()) / (1000 * 60));
          }

          await auditInterviewsHook.addInterview({
            auditId,
            themeId,
            title: interview['Titre'],
            description: `Thématique: ${themeName}`,
            startTime: startDateTime.toISOString(),
            durationMinutes,
            controlRefs: interview['Clause/Contrôle'],
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing standard audit plan:', error);
      return false;
    }
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
        themes,
        interviews: auditInterviewsHook.interviews,
        standardClauses,
        loading,
        addCompany: companiesHook.addCompany,
        addAudit: auditsHook.addAudit,
        updateAudit: auditsHook.updateAudit,
        deleteAudit: auditsHook.deleteAudit,
        fetchAudits: auditsHook.fetchAudits,
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
        fetchThemes,
        fetchStandardClauses,
        addTopic: auditTopicsHook.addTopic,
        addTheme,
        updateTopic: auditTopicsHook.updateTopic,
        updateTheme,
        deleteTopic: auditTopicsHook.deleteTopic,
        deleteTheme,
        associateControlsWithTopic: auditTopicsHook.associateControlsWithTopic,
        getControlsByTopicId: auditTopicsHook.getControlsByTopicId,
        
        fetchInterviewsByAuditId: auditInterviewsHook.fetchInterviewsByAuditId,
        addInterview: auditInterviewsHook.addInterview,
        updateInterview: auditInterviewsHook.updateInterview,
        deleteInterview: auditInterviewsHook.deleteInterview,
        addParticipant: auditInterviewsHook.addParticipant,
        removeParticipant: auditInterviewsHook.removeParticipant,
        getParticipantsByInterviewId: auditInterviewsHook.getParticipantsByInterviewId,
        generateAuditPlan: auditInterviewsHook.generateAuditPlan,
        importStandardAuditPlan
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
