import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Company, Audit, Framework, FrameworkControl, AuditStep, Finding, AuditTopic, AuditTheme, AuditInterview, InterviewParticipant, StandardClause, User, Service, ConsultingProject, RssiService } from '@/types';
import { DataContextProps } from './types/dataContextTypes';
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
import { useAuth } from './hooks/useAuth';
import { useRiskAnalysis } from './hooks/useRiskAnalysis';

export const DataContext = createContext<DataContextProps>({} as DataContextProps);

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [consultingProjects, setConsultingProjects] = useState<ConsultingProject[]>([]);
  const [rssiServices, setRssiServices] = useState<RssiService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingConsultingProjects, setLoadingConsultingProjects] = useState(false);
  const [loadingRssiServices, setLoadingRssiServices] = useState(false);

  const companiesHook = useCompanies();
  const auditsHook = useAudits();
  const findingsHook = useFindings();
  const auditStepsHook = useAuditSteps();
  const frameworksHook = useFrameworks();
  const controlsHook = useControls();
  const topicsHook = useAuditTopics();
  const themesHook = useThemes();
  const clausesHook = useStandardClauses();
  const interviewsHook = useAuditInterviews();
  const usersHook = useUsers();
  const authHook = useAuth();
  const riskAnalysisHook = useRiskAnalysis();

  useEffect(() => {
    const initialCompanies: Company[] = [
      {
        id: '1',
        name: 'Kollègue',
        activity: 'ESN',
        creationYear: 2018,
        parentCompany: 'Inetum',
        marketScope: 'France',
        lastAuditDate: '2023-01-01',
      },
      {
        id: '2',
        name: 'La Poste',
        activity: 'Courrier',
        creationYear: 1500,
        marketScope: 'France',
        lastAuditDate: '2023-06-01',
      },
    ];
    setCompanies(initialCompanies);

    const initialServices: Service[] = [
      {
        id: '1',
        companyId: '1',
        name: 'Audit de sécurité',
        description: 'Audit de sécurité du SI',
        type: 'audit',
        status: 'actif',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        createdAt: '2023-01-01',
      },
      {
        id: '2',
        companyId: '1',
        name: 'RSSI as a Service',
        description: 'RSSI as a Service',
        type: 'rssi_as_service',
        status: 'actif',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        createdAt: '2023-01-01',
      },
      {
        id: '3',
        companyId: '2',
        name: 'Accompagnement ISO 27001',
        description: 'Accompagnement ISO 27001',
        type: 'conseil',
        status: 'actif',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        createdAt: '2023-01-01',
      }
    ];
    setServices(initialServices);

    const initialConsultingProjects: ConsultingProject[] = [
      {
        id: '1',
        serviceId: '3',
        name: 'Préparation à la certification ISO 27001',
        description: 'Préparation à la certification ISO 27001',
        status: 'actif',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        frameworkId: '1',
        createdAt: '2023-01-01',
      }
    ];
    setConsultingProjects(initialConsultingProjects);

    const initialRssiServices: RssiService[] = [
      {
        id: '1',
        serviceId: '2',
        allocationTime: 40,
        tasks: 'Pilotage de la sécurité, gestion des risques, gestion des incidents',
        createdAt: '2023-01-01',
      }
    ];
    setRssiServices(initialRssiServices);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([
      companiesHook.fetchCompanies(),
      frameworksHook.fetchFrameworks()
    ]);
  };

  const contextValue: DataContextProps = {
    companies: companiesHook.companies,
    audits: auditsHook.audits,
    frameworks: frameworksHook.frameworks,
    controls: controlsHook.controls,
    auditSteps: auditStepsHook.auditSteps,
    findings: findingsHook.findings,
    topics: topicsHook.topics,
    themes: themesHook.themes,
    interviews: interviewsHook.interviews,
    standardClauses: clausesHook.standardClauses,
    users: usersHook.users,
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
    refreshFrameworks: frameworksHook.fetchFrameworks,
    assignAuditors: auditsHook.assignAuditors,
    getAuditAuditors: auditsHook.getAuditAuditors,
    fetchTopics: topicsHook.fetchTopics,
    fetchThemes: themesHook.fetchThemes,
    fetchStandardClauses: clausesHook.fetchStandardClauses,
    addTopic: topicsHook.addTopic,
    addTheme: themesHook.addTheme,
    updateTopic: topicsHook.updateTopic,
    updateTheme: themesHook.updateTheme,
    deleteTopic: topicsHook.deleteTopic,
    deleteTheme: themesHook.deleteTheme,
    associateControlsWithTopic: topicsHook.associateControlsWithTopic,
    getControlsByTopicId: topicsHook.getControlsByTopicId,
    fetchInterviewsByAuditId: interviewsHook.fetchInterviewsByAuditId,
    hasPlanForAudit: interviewsHook.hasPlanForAudit,
    addInterview: interviewsHook.addInterview,
    updateInterview: interviewsHook.updateInterview,
    deleteInterview: interviewsHook.deleteInterview,
    addParticipant: interviewsHook.addParticipant,
    removeParticipant: interviewsHook.removeParticipant,
    getParticipantsByInterviewId: interviewsHook.getParticipantsByInterviewId,
    generateAuditPlan: interviewsHook.generateAuditPlan,
    importStandardAuditPlan: interviewsHook.importStandardAuditPlan,
    fetchUsers: usersHook.fetchUsers,
    getUserById: usersHook.getUserById,
    getUsersByRole: usersHook.getUsersByRole,
    fetchThemesByFrameworkId: interviewsHook.fetchThemesByFrameworkId,
    
    services,
    consultingProjects,
    rssiServices,
    addService,
    addConsultingProject,
    addRssiService,
    getServicesByCompanyId,
    getConsultingProjectsByServiceId,
    getRssiServicesByServiceId,
    fetchServices,
    fetchConsultingProjects,
    fetchRssiServices,
    
    riskAssets: riskAnalysisHook.riskAssets,
    riskThreats: riskAnalysisHook.riskThreats,
    riskVulnerabilities: riskAnalysisHook.riskVulnerabilities,
    riskScenarios: riskAnalysisHook.riskScenarios,
    riskTreatments: riskAnalysisHook.riskTreatments,
    fetchRiskAssetsByCompanyId: riskAnalysisHook.fetchRiskAssetsByCompanyId,
    fetchRiskThreatsByCompanyId: riskAnalysisHook.fetchRiskThreatsByCompanyId,
    fetchRiskVulnerabilitiesByCompanyId: riskAnalysisHook.fetchRiskVulnerabilitiesByCompanyId,
    fetchRiskScenariosByCompanyId: riskAnalysisHook.fetchRiskScenariosByCompanyId,
    fetchRiskTreatmentsByScenarioId: riskAnalysisHook.fetchRiskTreatmentsByScenarioId,
    addRiskAsset: riskAnalysisHook.addRiskAsset,
    addRiskThreat: riskAnalysisHook.addRiskThreat,
    addRiskVulnerability: riskAnalysisHook.addRiskVulnerability,
    addRiskScenario: riskAnalysisHook.addRiskScenario,
    addRiskTreatment: riskAnalysisHook.addRiskTreatment,
    updateRiskAsset: riskAnalysisHook.updateRiskAsset,
    updateRiskThreat: riskAnalysisHook.updateRiskThreat,
    updateRiskVulnerability: riskAnalysisHook.updateRiskVulnerability,
    updateRiskScenario: riskAnalysisHook.updateRiskScenario,
    updateRiskTreatment: riskAnalysisHook.updateRiskTreatment,
    deleteRiskAsset: riskAnalysisHook.deleteRiskAsset,
    deleteRiskThreat: riskAnalysisHook.deleteRiskThreat,
    deleteRiskVulnerability: riskAnalysisHook.deleteRiskVulnerability,
    deleteRiskScenario: riskAnalysisHook.deleteRiskScenario,
    deleteRiskTreatment: riskAnalysisHook.deleteRiskTreatment,
    associateRiskScenarioWithAsset: riskAnalysisHook.associateRiskScenarioWithAsset,
    removeRiskScenarioAssetAssociation: riskAnalysisHook.removeRiskScenarioAssetAssociation,
    getRiskScenarioAssets: riskAnalysisHook.getRiskScenarioAssets,
    
    loading: {
      companies: companiesHook.loading,
      frameworks: frameworksHook.loading,
      controls: controlsHook.loading,
      topics: topicsHook.loading,
      interviews: interviewsHook.loading,
      themes: themesHook.loading,
      standardClauses: clausesHook.loading,
      audits: auditsHook.loading,
      users: usersHook.loading,
      services: loadingServices,
      consultingProjects: loadingConsultingProjects,
      rssiServices: loadingRssiServices,
      riskAssets: riskAnalysisHook.loading.riskAssets,
      riskThreats: riskAnalysisHook.loading.riskThreats,
      riskVulnerabilities: riskAnalysisHook.loading.riskVulnerabilities,
      riskScenarios: riskAnalysisHook.loading.riskScenarios,
      riskTreatments: riskAnalysisHook.loading.riskTreatments
    }
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
