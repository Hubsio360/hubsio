
import { RiskLevel } from './common';
import { Json } from './supabase';
import { RiskScenarioScope } from './risk-scenario';

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

// Fonction utilitaire pour mapper entre les formats camelCase et snake_case
export function mapRiskScenarioToDb(scenario: any) {
  return {
    company_id: scenario.companyId,
    name: scenario.name,
    description: scenario.description,
    threat_id: scenario.threatId,
    vulnerability_id: scenario.vulnerabilityId,
    impact_description: scenario.impactDescription,
    impact_level: scenario.impactLevel,
    likelihood: scenario.likelihood,
    risk_level: scenario.riskLevel,
    status: scenario.status,
    scope: scenario.scope,
    residual_impact: scenario.residualImpact,
    residual_likelihood: scenario.residualLikelihood,
    residual_risk_level: scenario.residualRiskLevel,
    security_measures: scenario.securityMeasures,
    measure_effectiveness: scenario.measureEffectiveness,
    impact_scale_ratings: scenario.impactScaleRatings
  };
}

export function mapDbToRiskScenario(dbScenario: any) {
  return {
    id: dbScenario.id,
    company_id: dbScenario.company_id,
    companyId: dbScenario.company_id,
    name: dbScenario.name,
    description: dbScenario.description,
    threatId: dbScenario.threat_id,
    threat_id: dbScenario.threat_id,
    vulnerabilityId: dbScenario.vulnerability_id,
    vulnerability_id: dbScenario.vulnerability_id,
    impactDescription: dbScenario.impact_description,
    impact_description: dbScenario.impact_description,
    impactLevel: dbScenario.impact_level,
    impact_level: dbScenario.impact_level,
    likelihood: dbScenario.likelihood,
    riskLevel: dbScenario.risk_level,
    risk_level: dbScenario.risk_level,
    status: dbScenario.status,
    scope: dbScenario.scope,
    rawImpact: dbScenario.rawImpact || dbScenario.impact_level,
    rawLikelihood: dbScenario.rawLikelihood || dbScenario.likelihood,
    rawRiskLevel: dbScenario.rawRiskLevel || dbScenario.risk_level,
    residualImpact: dbScenario.residual_impact,
    residual_impact: dbScenario.residual_impact,
    residualLikelihood: dbScenario.residual_likelihood,
    residual_likelihood: dbScenario.residual_likelihood,
    residualRiskLevel: dbScenario.residual_risk_level,
    residual_risk_level: dbScenario.residual_risk_level,
    securityMeasures: dbScenario.security_measures,
    security_measures: dbScenario.security_measures,
    measureEffectiveness: dbScenario.measure_effectiveness,
    measure_effectiveness: dbScenario.measure_effectiveness,
    impactScaleRatings: dbScenario.impact_scale_ratings,
    impact_scale_ratings: dbScenario.impact_scale_ratings,
    createdAt: dbScenario.created_at,
    created_at: dbScenario.created_at,
    updatedAt: dbScenario.updated_at,
    updated_at: dbScenario.updated_at
  };
}
