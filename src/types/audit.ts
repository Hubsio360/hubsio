
// Types for the audits and interviews
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

// Types for the audits and the audit steps
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
  controlIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Types for the clauses standards and themes d'audit
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

export interface AuditTopic {
  id: string;
  name: string;
  description?: string;
}

// Types supplémentaires pouvant être utilisés pour les audits
export interface AuditReport {
  auditId: string;
  markdownContent: string;
  classification?: string;
  pdfUrl?: string;
  generatedAt: string;
  updatedAt: string;
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

export type FindingCategory = 'conformity' | 'non_conformity' | 'observation' | 'recommendation' | 'non_conformity_major' | 'non_conformity_minor' | 'sensitive_point' | 'improvement_opportunity' | 'strength';
export type FindingStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'pending_review' | 'validated';
