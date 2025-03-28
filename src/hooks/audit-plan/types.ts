
import { AuditTheme, AuditInterview } from '@/types';

export interface UseAuditPlanGeneratorProps {
  auditId: string;
  frameworkId?: string;
  startDate: string;
  endDate: string;
  onPlanGenerated?: (targetTab?: string) => void;
}

export interface PlanGenerationOptions {
  topicIds: string[];
  selectedDays: string[];
  themeDurations: Record<string, number>;
  maxHoursPerDay: number;
}

export interface AuditPlanState {
  selectedTopicIds: string[];
  selectedDays: string[];
  themeDurations: Record<string, number>;
  generating: boolean;
  interviews: number;
  existingInterviews: number;
  existingThemes: number;
  initialLoad: boolean;
  maxHoursPerDay: number;
  previewInterviews: Partial<AuditInterview>[];
  hasOpeningClosing: boolean;
}
