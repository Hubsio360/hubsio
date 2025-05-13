
// Add CtiResult type definition
export interface CtiResult {
  id?: string;
  companyId: string;
  title: string;
  query: string;
  content: string;
  result?: any;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

// Re-export risk scale types correctly
export type { 
  CompanyRiskScale, 
  RiskScaleLevel, 
  RiskScaleType,
  RiskScaleWithLevels 
} from './risk-scales';

// Add missing AuditTopic interface
export interface AuditTopic {
  id: string;
  name: string;
  description?: string;
}

// Add missing User fields
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

// Add missing Company fields
export interface Company {
  id: string;
  name: string;
  activity?: string;
  parentCompany?: string;
  marketScope?: string;
  creationYear?: number;
  lastAuditDate?: string;
}

// Add InterviewParticipant interface
export interface InterviewParticipant {
  id: string;
  interviewId: string;
  userId: string;
  role: string;
}

// Add necessary risk analysis interfaces
export interface RiskAsset {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  category?: string;
  criticality?: string;
}

export enum RiskScope {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  BOTH = 'both'
}

export enum RiskStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  MITIGATED = 'mitigated'
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskScenario {
  id: string;
  name: string;
  description: string;
  companyId: string;
  scope?: RiskScope;
  status?: RiskStatus;
  likelihood?: RiskLevel;
  impact?: RiskLevel;
  threatId?: string;
  vulnerabilityId?: string;
  impactScaleRatings?: Record<string, number>;
  riskLevel?: string;
  residualRiskLevel?: string;
}

export interface RiskThreat {
  id: string;
  name: string;
  description: string;
  companyId: string;
}

export interface RiskVulnerability {
  id: string;
  name: string;
  description: string;
  companyId: string;
}

export interface RissiService {
  id: string;
  serviceId: string;
  allocationTime: number;
}

// Template for risk scenarios
export interface RiskScenarioTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
}
