
import { RiskScenario } from '@/types';

export interface BusinessProcess {
  id: string;
  name: string;
  description?: string;
}

export interface SuggestedScenario {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export interface CompanyInfo {
  name: string;
  description: string;
  activities: string;
}

export interface RiskScenarioCreate {
  companyId: string;
  name: string;
  description?: string;
  status: string;
  scope: string;
  riskLevel: string;
  impactLevel: string;
  likelihood: string;
  rawImpact?: string;
  rawLikelihood?: string;
  rawRiskLevel?: string;
  residualImpact?: string;
  residualLikelihood?: string;
  residualRiskLevel?: string;
}
