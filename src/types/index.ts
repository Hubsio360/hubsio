// Types pour les clauses standards et thèmes d'audit
export interface StandardClause {
  id: string;
  referenceCode: string;
  title: string;
  standardId: string;
  description?: string;
}

export interface AuditTheme {
  id: string;
  name: string;
  description?: string;
}

// Types pour les audits et interviews
export interface AuditInterview {
  id: string;
  auditId: string;
  topicId?: string;
  themeId?: string;
  title: string;
  description?: string;
  startTime: string;
  durationMinutes: number;
  location?: string;
  meetingLink?: string;
  controlRefs?: string;
}

export interface InterviewParticipant {
  interviewId: string;
  userId: string;
  role: string;
  notificationSent: boolean;
}

// Types pour les utilisateurs
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'admin' | 'auditor' | 'viewer';

// Types pour les audits et les étapes d'audit
export interface Audit {
  id: string;
  companyId: string;
  frameworkId: string;
  createdById: string;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  scope?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AuditStatus = 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'review';

export interface AuditStep {
  id: string;
  auditId: string;
  title: string;
  description?: string;
  order: number;
  controlIds?: string[]; // Ajout de cette propriété manquante
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les entreprises
export interface Company {
  id: string;
  name: string;
  activity?: string;
  creationYear?: number;
  parentCompany?: string;
  marketScope?: string;
  lastAuditDate?: string;
}

// Types pour les frameworks et contrôles
export interface Framework {
  id: string;
  name: string;
  version: string;
}

export interface FrameworkControl {
  id: string;
  frameworkId: string;
  referenceCode: string;
  title: string;
  description?: string;
}

export interface FrameworkImport {
  name: string;
  version: string;
  controls: Omit<FrameworkControl, 'id' | 'frameworkId'>[];
}

export interface FrameworkImportResult {
  framework: Framework;
  controlsCount: number;
}

// Types pour les sujets d'audit
export interface AuditTopic {
  id: string;
  name: string;
  description?: string;
}

// Types pour les constats (findings)
export interface Finding {
  id: string;
  auditStepId: string;
  controlId: string;
  authorId: string;
  rawText: string;
  refinedText?: string;
  category: FindingCategory;
  status: FindingStatus;
  createdAt: string;
  updatedAt: string;
}

export type FindingCategory = 'conformity' | 'non_conformity' | 'observation' | 'recommendation' | 'non_conformity_major' | 'non_conformity_minor' | 'sensitive_point' | 'improvement_opportunity' | 'strength';
export type FindingStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'pending_review' | 'validated';

// Types supplémentaires pouvant être utilisés dans l'application
export interface AuditReport {
  auditId: string;
  markdownContent: string;
  classification?: string;
  pdfUrl?: string;
  generatedAt: string;
  updatedAt: string;
}

export interface Invoice {
  auditId: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
  status: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Nouveaux types pour les services et métiers d'Akant

export type ServiceType = 'conseil' | 'audit' | 'rssi_as_service';

export interface Service {
  id: string;
  companyId: string;
  type: ServiceType;
  name?: string; // Added this field
  startDate: string;
  endDate?: string;
  status: string;
  description?: string; // Added this field
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsultingProject {
  id: string;
  serviceId: string;
  name: string;
  scope?: string;
  status: string;
  description?: string; // Added this field
  startDate?: string; // Added this field
  endDate?: string; // Added this field 
  frameworkId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RssiService {
  id: string;
  serviceId: string;
  allocationTime: number;
  mainContactName?: string;
  status?: string;
  tasks?: string; // Added this field
  slaDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Risk Analysis Types
export type RiskStatus = 'identified' | 'analyzed' | 'treated' | 'accepted' | 'monitored';
export type RiskTreatmentStrategy = 'reduce' | 'maintain' | 'avoid' | 'share';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskScope = 'technical' | 'organizational' | 'human' | 'physical' | 'environmental';

export interface RiskAsset {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category: string;
  owner?: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskThreat {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  source: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskVulnerability {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskScenario {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  impactLevel: RiskLevel;
  likelihood: RiskLevel;
  riskLevel: RiskLevel;
  scope: RiskScope;
  status: RiskStatus;
  threatId?: string;
  vulnerabilityId?: string;
  impactDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  // Risk Assessment fields
  rawImpact?: RiskLevel;
  rawLikelihood?: RiskLevel;
  rawRiskLevel?: RiskLevel;
  residualImpact?: RiskLevel;
  residualLikelihood?: RiskLevel;
  residualRiskLevel?: RiskLevel;
  securityMeasures?: string;
  measureEffectiveness?: string;
  // Impact scale ratings field
  impactScaleRatings?: Record<string, RiskLevel>;
  
  // Database field mappings
  company_id?: string;
  created_at?: string;
  updated_at?: string;
  impact_level?: RiskLevel;
  risk_level?: RiskLevel;
  threat_id?: string;
  vulnerability_id?: string;
  impact_description?: string;
  raw_impact?: RiskLevel;
  raw_likelihood?: RiskLevel;
  raw_risk_level?: RiskLevel;
  residual_impact?: RiskLevel;
  residual_likelihood?: RiskLevel;
  residual_risk_level?: RiskLevel;
  security_measures?: string;
  measure_effectiveness?: string;
  impact_scale_ratings?: Record<string, RiskLevel> | any;
}

export interface RiskTreatment {
  id: string;
  riskScenarioId: string;
  strategy: RiskTreatmentStrategy;
  description: string;
  responsible?: string;
  deadline?: string;
  status: string;
  residualRiskLevel?: RiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface RiskScenarioAsset {
  riskScenarioId: string;
  assetId: string;
}

// Export RiskScenarioTemplate type
export interface RiskScenarioTemplate {
  id: string;
  scenario_description: string;
  domain: string;
}

// CTI Result type
export interface CtiResult {
  id?: string;
  companyId: string;
  query: string;
  result: string;
  createdAt?: string;
  updatedAt?: string;
  // Add fields needed in CTI.tsx
  title?: string;
  content?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Export type definitions properly
export type { RiskScaleType, CompanyRiskScale, RiskScaleLevel, RiskScaleWithLevels, RiskAssessment } from './risk-scales';
