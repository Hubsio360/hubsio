
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
import { useUsers } from './hooks/useUsers';
import { useServices } from './hooks/useServices';
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
  const usersHook = useUsers();
  const servicesHook = useServices();

  const loading = {
    frameworks: frameworksHook.loading,
    controls: controlsHook.loading,
    topics: auditTopicsHook.loading,
    interviews: auditInterviewsHook.loading,
    themes: themesHook.loading,
    standardClauses: standardClausesHook.loading,
    audits: auditsHook.loading,
    users: usersHook.loading,
    services: servicesHook.loading.services,
    consultingProjects: servicesHook.loading.consultingProjects,
    rssiServices: servicesHook.loading.rssiServices
  };

  const refreshFrameworks = async () => {
    await frameworksHook.fetchFrameworks();
    await controlsHook.fetchControls();
  };

  const handleImportStandardAuditPlan = async (auditId: string, planData: any[], customThemes?: any[]): Promise<boolean> => {
    console.log(`DataProvider: Starting import of standard audit plan for audit ID: ${auditId}`);
    
    if (!auditId) {
      console.error('DataProvider: No audit ID provided for plan creation');
      return false;
    }
    
    try {
      let themes;
      if (customThemes && Array.isArray(customThemes) && customThemes.length > 0) {
        console.log(`DataProvider: Using ${customThemes.length} custom themes`);
        themes = customThemes;
      } else {
        themes = await themesHook.fetchThemes();
        console.log(`DataProvider: Loaded ${themes.length} themes from database`);
      }
      
      const clauses = await standardClausesHook.fetchStandardClauses();
      
      console.log(`DataProvider: Loaded ${themes.length} themes and ${clauses.length} standard clauses`);
      
      const result = await importStandardAuditPlan(
        auditId, 
        planData, 
        themes, 
        clauses,
        themesHook.addTheme, 
        auditInterviewsHook.addInterview,
        auditTopicsHook.addTopic,
        auditTopicsHook.associateControlsWithTopic
      );
      
      console.log(`DataProvider: Import result: ${result ? 'Success' : 'Failed'}`);
      return result;
    } catch (error) {
      console.error('DataProvider: Error importing standard audit plan:', error);
      return false;
    }
  };

  const hasPlanForAudit = async (auditId: string): Promise<boolean> => {
    try {
      const interviews = await auditInterviewsHook.fetchRealInterviewsFromDB(auditId);
      return interviews.length > 0;
    } catch (error) {
      console.error('Error checking if audit has a plan:', error);
      return false;
    }
  };

  const fetchThemesByFrameworkId = async (frameworkId: string) => {
    console.log('DataProvider: Delegating fetchThemesByFrameworkId to auditInterviewsHook');
    return auditInterviewsHook.fetchThemesByFrameworkId(frameworkId);
  };

  // Fix for addParticipant adapter
  const addParticipantAdapter = async (participant: Parameters<typeof auditInterviewsHook.addParticipant>[0]) => {
    return auditInterviewsHook.addParticipant(participant);
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
        users: usersHook.users,
        services: servicesHook.services,
        consultingProjects: servicesHook.consultingProjects,
        rssiServices: servicesHook.rssiServices,
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
        hasPlanForAudit,
        addInterview: auditInterviewsHook.addInterview,
        updateInterview: auditInterviewsHook.updateInterview,
        deleteInterview: auditInterviewsHook.deleteInterview,
        addParticipant: addParticipantAdapter,
        removeParticipant: auditInterviewsHook.removeParticipant,
        getParticipantsByInterviewId: auditInterviewsHook.getParticipantsByInterviewId,
        generateAuditPlan: auditInterviewsHook.generateAuditPlan,
        importStandardAuditPlan: handleImportStandardAuditPlan,
        fetchUsers: usersHook.fetchUsers,
        getUserById: usersHook.getUserById,
        getUsersByRole: usersHook.getUsersByRole,
        fetchThemesByFrameworkId,
        addService: servicesHook.addService,
        addConsultingProject: servicesHook.addConsultingProject,
        addRssiService: servicesHook.addRssiService,
        getServicesByCompanyId: servicesHook.getServicesByCompanyId,
        getConsultingProjectsByServiceId: servicesHook.getConsultingProjectsByServiceId,
        getRssiServicesByServiceId: servicesHook.getRssiServicesByServiceId,
        fetchServices: servicesHook.fetchServices,
        fetchConsultingProjects: servicesHook.fetchConsultingProjects,
        fetchRssiServices: servicesHook.fetchRssiServices
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
