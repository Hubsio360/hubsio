
import { Company, Audit, Framework, FrameworkControl, AuditStep, Finding, AuditTopic, AuditTheme, AuditInterview, InterviewParticipant, StandardClause, User, Service, ConsultingProject, RssiService, RiskAsset, RiskThreat, RiskVulnerability, RiskScenario, RiskTreatment, RiskScaleType, CompanyRiskScale, RiskScaleLevel, RiskScaleWithLevels, UserRole } from '@/types';
import { RiskScenarioTemplate } from '../hooks/useRiskScenarioTemplates';

type FrameworkImport = any; // Replace with proper type if available
type FrameworkImportResult = any; // Replace with proper type if available

export interface DataContextProps {
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
  users: User[];
  services: Service[];
  consultingProjects: ConsultingProject[];
  rssiServices: RssiService[];
  riskAssets: RiskAsset[];
  riskThreats: RiskThreat[];
  riskVulnerabilities: RiskVulnerability[];
  riskScenarios: RiskScenario[];
  riskTreatments: RiskTreatment[];
  riskScaleTypes: RiskScaleType[];
  companyRiskScales: RiskScaleWithLevels[];
  
  loading: {
    companies: boolean | Record<string, boolean>;
    frameworks: any;
    controls: any;
    topics: any;
    interviews: any;
    themes: any;
    standardClauses: any;
    audits: any;
    users: any;
    services: any; 
    consultingProjects: any;
    rssiServices: any;
    riskAssets: any;
    riskThreats: any;
    riskVulnerabilities: any;
    riskScenarios: any;
    riskTreatments: any;
    riskScaleTypes: any;
    companyRiskScales: any;
  };
  
  addCompany: (company: Omit<Company, 'id'>) => Promise<Company>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<Company>; // Nouvelle fonction
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
  hasPlanForAudit: (auditId: string) => Promise<boolean>;
  addInterview: (interview: Omit<AuditInterview, 'id'>) => Promise<AuditInterview | null>;
  updateInterview: (id: string, updates: Partial<AuditInterview>) => Promise<AuditInterview | null>;
  deleteInterview: (id: string) => Promise<boolean>;
  addParticipant: (participant: Omit<InterviewParticipant, 'notificationSent'>) => Promise<boolean>;
  removeParticipant: (interviewId: string, userId: string) => Promise<boolean>;
  getParticipantsByInterviewId: (interviewId: string) => Promise<InterviewParticipant[]>;
  generateAuditPlan: (auditId: string, startDate: string, endDate: string, options?: {
    topicIds?: string[];
    selectedDays?: string[];
    themeDurations?: Record<string, number>;
    maxHoursPerDay?: number;
  }) => Promise<boolean>;
  importStandardAuditPlan: (auditId: string, planData: any[], customThemes?: any[]) => Promise<boolean>;
  
  fetchUsers: () => Promise<User[]>;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (roles: UserRole[]) => User[];
  
  fetchThemesByFrameworkId: (frameworkId: string) => Promise<AuditTheme[]>;
  
  addService: (service: Omit<Service, 'id'>) => Promise<Service>;
  addConsultingProject: (project: Omit<ConsultingProject, 'id'>) => Promise<ConsultingProject>;
  addRssiService: (rssiService: Omit<RssiService, 'id'>) => Promise<RssiService>;
  getServicesByCompanyId: (companyId: string) => Service[];
  getConsultingProjectsByServiceId: (serviceId: string) => ConsultingProject[];
  getRssiServicesByServiceId: (serviceId: string) => RssiService | undefined;
  fetchServices: () => Promise<void>;
  fetchConsultingProjects: () => Promise<void>;
  fetchRssiServices: () => Promise<void>;
  
  fetchRiskAssetsByCompanyId: (companyId: string) => Promise<RiskAsset[]>;
  fetchRiskThreatsByCompanyId: (companyId: string) => Promise<RiskThreat[]>;
  fetchRiskVulnerabilitiesByCompanyId: (companyId: string) => Promise<RiskVulnerability[]>;
  fetchRiskScenariosByCompanyId: (companyId: string) => Promise<RiskScenario[]>;
  fetchRiskTreatmentsByScenarioId: (scenarioId: string) => Promise<RiskTreatment[]>;
  
  addRiskAsset: (asset: Omit<RiskAsset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RiskAsset>;
  addRiskThreat: (threat: Omit<RiskThreat, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RiskThreat>;
  addRiskVulnerability: (vulnerability: Omit<RiskVulnerability, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RiskVulnerability>;
  addRiskScenario: (scenario: Omit<RiskScenario, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RiskScenario>;
  createRiskScenario: (scenario: Omit<RiskScenario, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RiskScenario>;
  addRiskTreatment: (treatment: Omit<RiskTreatment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RiskTreatment>;
  
  updateRiskAsset: (id: string, asset: Partial<RiskAsset>) => Promise<RiskAsset>;
  updateRiskThreat: (id: string, threat: Partial<RiskThreat>) => Promise<RiskThreat>;
  updateRiskVulnerability: (id: string, vulnerability: Partial<RiskVulnerability>) => Promise<RiskVulnerability>;
  updateRiskScenario: (id: string, scenario: Partial<RiskScenario>) => Promise<RiskScenario>;
  updateRiskTreatment: (id: string, treatment: Partial<RiskTreatment>) => Promise<RiskTreatment>;
  
  deleteRiskAsset: (id: string) => Promise<boolean>;
  deleteRiskThreat: (id: string) => Promise<boolean>;
  deleteRiskVulnerability: (id: string) => Promise<boolean>;
  deleteRiskScenario: (id: string) => Promise<boolean>;
  deleteRiskTreatment: (id: string) => Promise<boolean>;
  
  associateRiskScenarioWithAsset: (scenarioId: string, assetId: string) => Promise<boolean>;
  removeRiskScenarioAssetAssociation: (scenarioId: string, assetId: string) => Promise<boolean>;
  getRiskScenarioAssets: (scenarioId: string) => Promise<RiskAsset[]>;
  
  fetchRiskScaleTypes: () => Promise<RiskScaleType[]>;
  fetchCompanyRiskScales: (companyId: string) => Promise<RiskScaleWithLevels[]>;
  ensureDefaultScalesExist: (companyId: string) => Promise<boolean>;
  addRiskScaleType: (name: string, description: string) => Promise<RiskScaleType | null>;
  updateRiskScaleType: (scaleTypeId: string, name: string, description: string) => Promise<RiskScaleType | null>;
  addCompanyRiskScale: (companyId: string, scaleTypeId: string, levels: Omit<RiskScaleLevel, 'id' | 'companyRiskScaleId' | 'createdAt' | 'updatedAt'>[]) => Promise<RiskScaleWithLevels | null>;
  updateRiskScaleLevel: (levelId: string, updatedData: Partial<RiskScaleLevel>) => Promise<RiskScaleLevel | null>;
  toggleRiskScaleActive: (scaleId: string, isActive: boolean) => Promise<boolean>;
  deleteRiskScale: (scaleId: string) => Promise<boolean>;
  setupLikelihoodScale: (companyId: string) => Promise<boolean>;
  
  fetchRiskScenarioTemplates: () => Promise<RiskScenarioTemplate[]>;
  getRiskScenarioTemplatesByDomain: (domain: string) => RiskScenarioTemplate[];
}
