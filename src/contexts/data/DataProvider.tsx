
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

  // Import hooks
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
    // Fetch initial data here, e.g., companies
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

  const addCompany = async (company: Omit<Company, 'id'>): Promise<Company> => {
    const newCompany: Company = {
      ...company,
      id: uuidv4(),
    };
    setCompanies([...companies, newCompany]);
    return newCompany;
  };

  const enrichCompanyData = async (companyId: string): Promise<Company> => {
    // Simulate API call to enrich company data
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedCompany = {
      ...getCompanyById(companyId),
      enriched: true,
    };
    setCompanies(companies.map(c => c.id === companyId ? updatedCompany : c));
    return updatedCompany;
  };

  const getCompanyById = (id: string): Company | undefined => {
    return companies.find(company => company.id === id);
  };

  const addService = async (service: Omit<Service, 'id'>): Promise<Service> => {
    const newService: Service = {
      ...service,
      id: uuidv4(),
    };
    setServices([...services, newService]);
    return newService;
  };

  const addConsultingProject = async (project: Omit<ConsultingProject, 'id'>): Promise<ConsultingProject> => {
    const newProject: ConsultingProject = {
      ...project,
      id: uuidv4(),
    };
    setConsultingProjects([...consultingProjects, newProject]);
    return newProject;
  };

  const addRssiService = async (rssiService: Omit<RssiService, 'id'>): Promise<RssiService> => {
    const newRssiService: RssiService = {
      ...rssiService,
      id: uuidv4(),
    };
    setRssiServices([...rssiServices, newRssiService]);
    return newRssiService;
  };

  const getServicesByCompanyId = (companyId: string): Service[] => {
    return services.filter(service => service.companyId === companyId);
  };

  const getConsultingProjectsByServiceId = (serviceId: string): ConsultingProject[] => {
    return consultingProjects.filter(project => project.serviceId === serviceId);
  };

  const getRssiServicesByServiceId = (serviceId: string): RssiService | undefined => {
    return rssiServices.find(rssiService => rssiService.serviceId === serviceId);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    // Simulate API call to fetch services
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoadingServices(false);
  };

  const fetchConsultingProjects = async () => {
    setLoadingConsultingProjects(true);
    // Simulate API call to fetch consulting projects
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoadingConsultingProjects(false);
  };

  const fetchRssiServices = async () => {
    setLoadingRssiServices(true);
    // Simulate API call to fetch rssi services
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoadingRssiServices(false);
  };

  const contextValue: DataContextProps = {
    companies,
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
    addCompany,
    addAudit: auditsHook.addAudit,
    updateAudit: auditsHook.updateAudit,
    deleteAudit: auditsHook.deleteAudit,
    fetchAudits: auditsHook.fetchAudits,
    addFinding: findingsHook.addFinding,
    updateFinding: findingsHook.updateFinding,
    enrichCompanyData,
    getAuditsByCompanyId: auditsHook.getAuditsByCompanyId,
    getFindingsByAuditStepId: findingsHook.getFindingsByAuditStepId,
    getAuditStepsByAuditId: auditStepsHook.getAuditStepsByAuditId,
    getCompanyById,
    getAuditById: auditsHook.getAuditById,
    getFrameworkById: frameworksHook.getFrameworkById,
    getControlById: controlsHook.getControlById,
    importFramework: frameworksHook.importFramework,
    updateFramework: frameworksHook.updateFramework,
    deleteFramework: frameworksHook.deleteFramework,
    updateControl: controlsHook.updateControl,
    addControl: controlsHook.addControl,
    refreshFrameworks: frameworksHook.refreshFrameworks,
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
    fetchThemesByFrameworkId: themesHook.fetchThemesByFrameworkId,
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
    
    // Risk Analysis
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
