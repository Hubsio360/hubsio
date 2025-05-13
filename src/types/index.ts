export interface Audit {
  id: string;
  companyId: string;
  frameworkId: string;
  startDate: string;
  endDate: string;
  status: string;
  scope?: string;
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Finding {
  id: string;
  auditStepId: string;
  title: string;
  description: string;
  recommendation: string;
  status: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Framework {
  id: string;
  name: string;
  version: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FrameworkControl {
  id: string;
  frameworkId: string;
  referenceCode: string;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  activity?: string;
  creationYear?: number;
  parentCompany?: string;
  marketScope?: string;
  lastAuditDate?: string;
}

export interface Service {
  id: string;
  companyId: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsultingProject {
  id: string;
  serviceId: string;
  name: string;
  scope?: string;
  status: string;
  frameworkId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RssiService {
  id: string;
  serviceId: string;
  allocationTime: number;
  mainContactName?: string;
  status: string;
  slaDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskAsset {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category: string;
  value: string;
  owner?: string;
}

export interface RiskThreat {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  motivation?: string;
  skillLevel?: string;
  resources?: string;
}

export interface RiskVulnerability {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  weakness?: string;
  likelihood?: string;
  technicalSeverity?: string;
}

export interface RiskScenario {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  threatId?: string;
  vulnerabilityId?: string;
  impact?: string;
  impactLevel?: RiskLevel;
  likelihood?: RiskLevel;
  riskLevel?: RiskLevel;
  rawImpact?: RiskLevel;
  rawLikelihood?: RiskLevel;
  rawRiskLevel?: RiskLevel;
  residualImpact?: RiskLevel;
  residualLikelihood?: RiskLevel;
  residualRiskLevel?: RiskLevel;
  status?: RiskStatus;
  scope?: RiskScope;
  impactDescription?: string;
  securityMeasures?: string;
  impactScaleRatings?: Record<string, any>;
}

export interface RiskTreatment {
  id: string;
  scenarioId: string;
  name: string;
  description?: string;
  treatmentType?: string;
  cost?: number;
  timeline?: string;
  responsibleParty?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = 'admin' | 'auditor' | 'viewer';

export interface StandardClause {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditInterview {
  id: string;
  auditId: string;
  topicId?: string;
  themeId?: string;
  startTime: string;
  title: string;
  description?: string;
  location?: string;
  meetingLink?: string;
  controlRefs?: string;
  durationMinutes: number;
}

export interface InterviewParticipant {
  id: string;
  interviewId: string;
  userId: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditTheme {
  id: string;
  name: string;
  description?: string;
  frameworkId?: string;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditTopic {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface RiskScenarioTemplate {
  id: string;
  domain: string;
  name: string;
  description: string;
  threats: string[];
  vulnerabilities: string[];
  assets: string[];
  impact: string;
  likelihood: string;
  riskLevel: string;
  securityMeasures: string;
}

export interface CtiResult {
  id: string;
  companyId: string;
  title: string;
  query: string;
  content: string;
  result: any;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export enum RiskScope {
  STRATEGIC = 'strategic',
  OPERATIONAL = 'operational',
  FINANCIAL = 'financial',
  COMPLIANCE = 'compliance',
  REPUTATION = 'reputation'
}

export enum RiskStatus {
  IDENTIFIED = 'identified',
  ANALYZED = 'analyzed',
  MITIGATED = 'mitigated',
  ACCEPTED = 'accepted',
  TRANSFERRED = 'transferred',
  CLOSED = 'closed'
}

export interface RiskScaleType {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskScaleLevel {
  id: string;
  companyRiskScaleId: string;
  levelValue: number;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRiskScale {
  id: string;
  companyId: string;
  scaleTypeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  levels?: RiskScaleLevel[];
}

export interface RiskScaleWithLevels extends CompanyRiskScale {
  levels: RiskScaleLevel[];
  scaleType?: RiskScaleType;
}

export type ThemeDurationSelectorProps = {
  themes: AuditTheme[];
  themeDurations: Record<string, number>;
  onDurationChange: (themeId: string, duration: number) => void;
  excludedThemeNames?: string[];
};
