
import { 
  Company, 
  Audit, 
  Framework, 
  FrameworkControl, 
  AuditStep,
  Finding,
  FrameworkImport,
  FrameworkImportResult,
  AuditTopic,
  AuditTheme,
  AuditInterview,
  InterviewParticipant,
  StandardClause
} from '@/types';

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
  loading: {
    frameworks: boolean;
    controls: boolean;
    topics: boolean;
    interviews: boolean;
    themes: boolean;
    standardClauses: boolean;
    audits: boolean;
  };
  addCompany: (company: Omit<Company, 'id'>) => Promise<Company>;
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
  generateAuditPlan: (auditId: string, startDate: string, endDate: string, options?: any) => Promise<boolean>;
  importStandardAuditPlan: (auditId: string, planData: any[], customThemes?: any[]) => Promise<boolean>;
}
