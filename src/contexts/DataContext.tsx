
import React, { createContext, useContext } from 'react';
import { DataProvider } from './DataProvider';
import {
  Audit,
  Company,
  Finding,
  Service,
  RiskAsset,
  RiskThreat,
  RiskVulnerability,
  RiskScenario,
  User,
  StandardClause,
  AuditInterview,
  InterviewParticipant,
} from '@/types';

import type { RiskScenarioTemplate } from '@/types';
import type { CompanyRiskScale, RiskScaleLevel, RiskScaleType, RiskScaleWithLevels } from '@/types/risk-scales';

// Define the shape of our interfaces for the context
interface Control {
  id: string;
  frameworkId: string;
  referenceCode: string;
  title: string;
  description?: string;
}

interface Framework {
  id: string;
  name: string;
  version: string;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
}

interface Theme {
  id: string;
  name: string;
  description?: string;
}

// This interface should match all the props expected by components that use DataContext
interface DataContextType {
  // Companies
  companies: Company[];
  loading: boolean | Record<string, boolean>;
  error: Error | null;
  fetchCompanies: () => Promise<Company[]>;
  addCompany: (companyData: { name: string; activity?: string; parentCompany?: string; marketScope?: string; creationYear?: number; }) => Promise<Company>;
  updateCompany: (id: string, companyData: { name?: string; activity?: string; parentCompany?: string; marketScope?: string; creationYear?: number; }) => Promise<Company>;
  getCompanyById: (id: string) => Company | undefined;
  enrichCompanyData: (companyId: string, organizationContext?: string) => Promise<Company>;
  
  // Frameworks
  frameworks: Framework[];
  getFrameworkById: (id: string) => Framework | undefined;
  fetchFrameworks: () => Promise<Framework[]>;
  addFramework: (name: string, version: string) => Promise<Framework>;
  updateFramework: (id: string, name: string, version: string) => Promise<Framework>;
  deleteFramework: (id: string) => Promise<void>;
  importFramework: (data: any) => Promise<any>;
  refreshFrameworks: () => Promise<Framework[]>;
  
  // Controls
  controls: Control[];
  fetchControlsByFramework: (frameworkId: string) => Promise<Control[]>;
  addControl: (frameworkId: string, referenceCode: string, title: string, description?: string) => Promise<Control>;
  updateControl: (id: string, data: { referenceCode?: string; title?: string; description?: string }) => Promise<Control>;
  deleteControl: (id: string) => Promise<void>;
  getControlById: (id: string) => Control | undefined;
  
  // Standard clauses
  standardClauses: StandardClause[];
  fetchStandardClauses: () => Promise<StandardClause[]>;
  
  // Topics
  topics: Topic[];
  fetchTopics: () => Promise<Topic[]>;
  addTopic: (name: string, description?: string) => Promise<Topic>;
  updateTopic: (id: string, name: string, description?: string) => Promise<Topic>;
  deleteTopic: (id: string) => Promise<void>;
  associateControlsWithTopic: (topicId: string, controlIds: string[]) => Promise<void>;
  getControlsByTopicId: (topicId: string) => Promise<Control[]>;
  
  // Themes
  themes: Theme[];
  fetchThemes: () => Promise<Theme[]>;
  addTheme: (name: string, description?: string) => Promise<Theme>;
  updateTheme: (id: string, name: string, description?: string) => Promise<Theme>;
  deleteTheme: (id: string) => Promise<void>;
  fetchThemesByFrameworkId: (frameworkId: string) => Promise<Theme[]>;
  
  // Audits
  audits: Audit[];
  getAuditsByCompanyId: (companyId: string) => Audit[];
  getAuditById: (id: string) => Audit | undefined;
  fetchAudits: () => Promise<Audit[]>;
  addAudit: (companyId: string, frameworkId: string, startDate: string, endDate: string, createdById: string, scope?: string) => Promise<Audit>;
  updateAudit: (id: string, data: { startDate?: string; endDate?: string; status?: string; scope?: string }) => Promise<Audit>;
  deleteAudit: (id: string) => Promise<void>;
  assignAuditors: (auditId: string, auditorIds: string[]) => Promise<void>;
  getAuditAuditors: (auditId: string) => Promise<User[]>;
  
  // Findings
  findings: Finding[];
  fetchFindingsByAuditStep: (auditStepId: string) => Promise<Finding[]>;
  getFindingsByAuditStepId: (auditStepId: string) => Promise<Finding[]>;
  addFinding: (data: any) => Promise<Finding>;
  updateFinding: (id: string, data: any) => Promise<Finding>;
  
  // Audit steps
  auditSteps: any[];
  fetchAuditSteps: (auditId: string) => Promise<any[]>;
  getAuditStepsByAuditId: (auditId: string) => Promise<any[]>;
  
  // Audit interviews
  interviews: AuditInterview[];
  fetchInterviewsByAuditId: (auditId: string) => Promise<AuditInterview[]>;
  hasPlanForAudit: (auditId: string) => Promise<boolean>;
  addInterview: (data: any) => Promise<AuditInterview>;
  updateInterview: (id: string, data: any) => Promise<AuditInterview>;
  deleteInterview: (id: string) => Promise<void>;
  addParticipant: (interviewId: string, userId: string, role: string) => Promise<InterviewParticipant>;
  removeParticipant: (interviewId: string, userId: string) => Promise<void>;
  getParticipantsByInterviewId: (interviewId: string) => Promise<InterviewParticipant[]>;
  generateAuditPlan: (auditId: string, startDate: string, endDate: string, options: any) => Promise<boolean>;
  importStandardAuditPlan: (auditId: string) => Promise<boolean>;
  
  // Services
  services: Service[];
  consultingProjects: any[];
  rssiServices: any[];
  fetchServices: () => Promise<Service[]>;
  fetchConsultingProjects: () => Promise<any[]>;
  fetchRssiServices: () => Promise<any[]>;
  fetchServicesByCompanyId: (companyId: string) => Promise<Service[]>;
  addService: (data: any) => Promise<Service>;
  addConsultingProject: (data: any) => Promise<any>;
  addRssiService: (data: any) => Promise<any>;
  getServicesByCompanyId: (companyId: string) => Promise<Service[]>;
  getConsultingProjectsByServiceId: (serviceId: string) => Promise<any[]>;
  getRssiServicesByServiceId: (serviceId: string) => Promise<any[]>;
  
  // Users
  users: User[];
  fetchUsers: () => Promise<User[]>;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: string) => Promise<User[]>;
  
  // Risk assets
  riskAssets: RiskAsset[];
  fetchRiskAssetsByCompanyId: (companyId: string) => Promise<RiskAsset[]>;
  addRiskAsset: (data: any) => Promise<RiskAsset>;
  updateRiskAsset: (id: string, data: any) => Promise<RiskAsset>;
  deleteRiskAsset: (id: string) => Promise<boolean>;
  
  // Risk threats
  riskThreats: RiskThreat[];
  fetchRiskThreatsByCompanyId: (companyId: string) => Promise<RiskThreat[]>;
  addRiskThreat: (data: any) => Promise<RiskThreat>;
  updateRiskThreat: (id: string, data: any) => Promise<RiskThreat>;
  deleteRiskThreat: (id: string) => Promise<boolean>;
  
  // Risk vulnerabilities
  riskVulnerabilities: RiskVulnerability[];
  fetchRiskVulnerabilitiesByCompanyId: (companyId: string) => Promise<RiskVulnerability[]>;
  addRiskVulnerability: (data: any) => Promise<RiskVulnerability>;
  updateRiskVulnerability: (id: string, data: any) => Promise<RiskVulnerability>;
  deleteRiskVulnerability: (id: string) => Promise<boolean>;
  
  // Risk scenarios
  riskScenarios: RiskScenario[];
  fetchRiskScenariosByCompanyId: (companyId: string) => Promise<RiskScenario[]>;
  addRiskScenario: (data: any) => Promise<RiskScenario>;
  createRiskScenario: (data: any) => Promise<RiskScenario>;
  updateRiskScenario: (id: string, data: any) => Promise<RiskScenario>;
  deleteRiskScenario: (id: string) => Promise<boolean>;
  associateRiskScenarioWithAsset: (scenarioId: string, assetId: string) => Promise<any>;
  removeRiskScenarioAssetAssociation: (scenarioId: string, assetId: string) => Promise<any>;
  getRiskScenarioAssets: (scenarioId: string) => Promise<RiskAsset[]>;
  
  // Risk scenario templates
  riskScenarioTemplates: RiskScenarioTemplate[];
  fetchRiskScenarioTemplates: () => Promise<RiskScenarioTemplate[]>;
  getRiskScenarioTemplatesByDomain: (domain: string) => Promise<RiskScenarioTemplate[]>;

  // Risk treatments
  riskTreatments: any[];
  addRiskTreatment: (data: any) => Promise<any>;
  updateRiskTreatment: (id: string, data: any) => Promise<any>;
  deleteRiskTreatment: (id: string) => Promise<boolean>;
  fetchRiskTreatmentsByScenarioId: (scenarioId: string) => Promise<any[]>;
  
  // Risk scales
  riskScales: any;
  riskScaleTypes: RiskScaleType[];
  companyRiskScales: RiskScaleWithLevels[];
  fetchRiskScaleTypes: () => Promise<RiskScaleType[]>;
  fetchCompanyRiskScales: (companyId: string) => Promise<CompanyRiskScale[]>;
  ensureDefaultScalesExist: (companyId: string) => Promise<boolean>;
  addRiskScaleType: (name: string, description: string) => Promise<RiskScaleType>;
  addCompanyRiskScale: (companyId: string, scaleTypeId: string, levels: RiskScaleLevel[]) => Promise<CompanyRiskScale>;
  updateRiskScaleLevel: (levelId: string, data: { name?: string; description?: string; color?: string }) => Promise<void>;
  updateRiskScaleType: (scaleTypeId: string, name: string, description: string) => Promise<RiskScaleType>;
  toggleRiskScaleActive: (scaleId: string, isActive: boolean) => Promise<void>;
  deleteRiskScale: (scaleId: string) => Promise<boolean>;
  setupLikelihoodScale: (companyId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export { DataContext, DataProvider };
