import React, { createContext, useContext, ReactNode } from 'react';
import { useCompanies } from './hooks/useCompanies';
import { useAudits } from './hooks/useAudits';
import { useFrameworks } from './hooks/useFrameworks';
import { useControls } from './hooks/useControls';
import { useAuditSteps } from './hooks/useAuditSteps';
import { useFindings } from './hooks/useFindings';
import { useAuditTopics } from './hooks/useAuditTopics';
import { useAuditInterviews } from './hooks/useAuditInterviews';
import { useThemes } from './hooks/useThemes';
import { useStandardClauses } from './hooks/useStandardClauses';
import { importStandardAuditPlan } from './utils/auditPlanUtils';
import { DataContextProps } from './types/dataContextTypes';

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
  const themesHook = useThemes();
  const standardClausesHook = useStandardClauses();

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

  const handleImportStandardAuditPlan = async (auditId: string, planData: any[]): Promise<boolean> => {
    const clauses = await standardClausesHook.fetchStandardClauses();
    
    return importStandardAuditPlan(
      auditId, 
      planData, 
      themesHook.themes, 
      clauses,
      themesHook.addTheme, 
      auditInterviewsHook.addInterview,
      auditTopicsHook.addTopic,
      auditTopicsHook.associateControlsWithTopic
    );
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
        themes: themesHook.themes,
        interviews: auditInterviewsHook.interviews,
        standardClauses: standardClausesHook.standardClauses,
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
        fetchThemes: themesHook.fetchThemes,
        fetchStandardClauses: standardClausesHook.fetchStandardClauses,
        addTopic: auditTopicsHook.addTopic,
        addTheme: themesHook.addTheme,
        updateTopic: auditTopicsHook.updateTopic,
        updateTheme: themesHook.updateTheme,
        deleteTopic: auditTopicsHook.deleteTopic,
        deleteTheme: themesHook.deleteTheme,
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
        importStandardAuditPlan: handleImportStandardAuditPlan
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
