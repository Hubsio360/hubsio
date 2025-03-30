
import { Json, RiskLevel } from './common';

export type RiskScope = 'technical' | 'organizational' | 'human' | 'physical' | 'environmental';
export type RiskStatus = 'identified' | 'analyzed' | 'treated' | 'accepted' | 'monitored';
export type RiskTreatmentStrategy = 'reduce' | 'maintain' | 'avoid' | 'share';

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
