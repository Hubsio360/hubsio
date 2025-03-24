
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

export interface AuditTopic {
  id: string;
  name: string;
  description?: string;
}

export interface AuditTheme {
  id: string;
  name: string;
  description?: string;
}

export interface AuditTopicControl {
  topicId: string;
  controlId: string;
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
  controlRefs?: string; // Stocke les références aux clauses/contrôles ISO
}

export interface InterviewParticipant {
  interviewId: string;
  userId: string;
  role: string;
  notificationSent: boolean;
}

export interface StandardClause {
  id: string;
  referenceCode: string; // Par exemple: "A.8.15"
  title: string; // Par exemple: "Sécurité des communications"
  description?: string;
  standardId: string; // Par exemple: "ISO27001:2022"
}
