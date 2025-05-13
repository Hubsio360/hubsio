export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskScenario {
  id: string;
  name: string;
  description?: string;
  impactDescription?: string;
  scope: string;
  riskLevel: RiskLevel;
  status: string;
  companyId: string;
  likelihood: RiskLevel;
  impactLevel: RiskLevel;
  rawRiskLevel?: string;
  rawLikelihood?: RiskLevel;
  rawImpact?: RiskLevel;
  residualRiskLevel?: string;
  residualLikelihood?: RiskLevel;
  residualImpact?: RiskLevel;
  securityMeasures?: string;
  measureEffectiveness?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditTheme {
  id: string;
  name: string;
  description?: string;
}

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
  controlRefs?: string[];
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    companyId: string;
}

export interface Audit {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    companyId: string;
    frameworkId: string;
    status: string;
    leadAuditorId: string;
    teamMembers: string[];
    objective?: string;
    scope?: string;
    criteria?: string;
}

export interface Company {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    industry: string;
    size: string;
}

export interface Framework {
    id: string;
    name: string;
    description: string;
    version: string;
    companyId: string;
}

export interface Control {
    id: string;
    frameworkId: string;
    name: string;
    description: string;
    family: string;
}

export interface Finding {
    id: string;
    auditId: string;
    controlId: string;
    title: string;
    description: string;
    recommendation: string;
    severity: string;
    status: string;
    assigneeId: string;
    dueDate: string;
}

export interface RssiService {
    id: string;
    serviceId: string;
    name: string;
    description: string;
    allocationTime: number;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceAllocation {
    id: string;
    userId: string;
    serviceId: string;
    allocationTime: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

// Re-export types from risk-scales.ts using export type to comply with isolatedModules
export type { RiskScaleCategory, RiskScaleDefinition, RiskScaleLevel, RiskScaleName } from './risk-scales';

// Add CtiResult type
export interface CtiResult {
  id?: string;
  title: string;
  query: string;
  content: string;
  companyId: string;
  result: any;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
