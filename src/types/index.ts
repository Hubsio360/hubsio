export interface AuditTheme {
  id: string;
  name: string;
  description?: string;
  frameworkId?: string;
}

export interface AuditInterview {
  id: string;
  auditId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  themeId?: string;
  topicId?: string;
  duration: number;
  status?: string;
  notes?: string;
}

export interface InterviewParticipant {
  id: string;
  interviewId: string;
  userId: string;
  role: string;
}

export interface Audit {
  id: string;
  companyId: string;
  frameworkId: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  createdById: string;
  scope?: string;
}

export interface Framework {
  id: string;
  name: string;
  version: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Finding {
  id: string;
  auditStepId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  recommendation?: string;
  deadline?: string;
  assignee?: string;
}

export interface StandardClause {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface Company {
  id: string;
  name: string;
  activity?: string;
  parentCompany?: string;
  marketScope?: string;
  creationYear?: number;
  organizationContext?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  phone?: string;
  numberOfEmployees?: number;
  sectors?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  type: string;
  contractValue?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RiskAsset {
  id: string;
  companyId: string;
  name: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  criticality?: string;
  confidentiality?: string;
  integrity?: string;
  availability?: string;
}

export interface RiskThreat {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  source?: string;
  motivation?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RiskVulnerability {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'critical';

export interface RiskScenario {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  threatId?: string;
  vulnerabilityId?: string;
  impact: RiskLevel;
  likelihood: RiskLevel;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt?: string;
  treatmentStrategy?: string;
  treatmentDescription?: string;
}

export interface RiskScenarioTemplate {
  id: string;
  domain: string;
  name: string;
  description: string;
  threatDescription?: string;
  vulnerabilityDescription?: string;
  impactDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CtiResult {
  id: string;
  companyId: string;
  title: string;
  query: string;
  content: string;
  result: any;
  createdAt: string;
  updatedAt?: string;
}
