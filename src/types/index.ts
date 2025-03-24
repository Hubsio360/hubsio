
export type UserRole = 'admin' | 'auditor' | 'reviewer';

export type AuditStatus = 'draft' | 'in_progress' | 'review' | 'completed';

export type FindingCategory = 
  | 'non_conformity_major' 
  | 'non_conformity_minor' 
  | 'sensitive_point' 
  | 'improvement_opportunity'
  | 'strength';

export type FindingStatus = 'draft' | 'pending_review' | 'validated';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
  description: string;
}

export interface Audit {
  id: string;
  companyId: string;
  frameworkId: string;
  startDate: string;
  endDate: string;
  scope?: string;
  createdById: string;
  status: AuditStatus;
}

export interface AuditUser {
  auditId: string;
  userId: string;
  roleInAudit: 'lead' | 'participant';
}

export interface AuditStep {
  id: string;
  auditId: string;
  title: string;
  description?: string;
  order: number;
  controlIds: string[];
}

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

export interface AuditReport {
  auditId: string;
  markdownContent: string;
  pdfUrl?: string;
  classification?: string;
  generatedAt: string;
}

export interface Invoice {
  auditId: string;
  status: 'pending' | 'sent' | 'paid';
  webhookUrl?: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
}

export interface FrameworkImport {
  name: string;
  version: string;
  controls: {
    referenceCode: string;
    title: string;
    description: string;
  }[];
}

export interface FrameworkImportResult {
  framework: Framework;
  controlsCount: number;
}
