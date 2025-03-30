
import { RiskLevel } from '@/types';
import { Json } from './supabase';

export interface RiskScenario {
  id: string;
  company_id: string;
  companyId?: string; // Alias for consistency
  name: string;
  description?: string;
  impact_description?: string;
  impactDescription?: string; // Alias for consistency
  status: 'identified' | 'analyzed' | 'treated' | 'accepted' | 'monitored';
  scope: 'organization' | 'system' | 'service' | 'process';
  created_at: string;
  createdAt?: string; // Alias
  updated_at: string;
  updatedAt?: string; // Alias
  impact_level: RiskLevel;
  impactLevel?: RiskLevel; // Alias
  likelihood: RiskLevel;
  risk_level: RiskLevel;
  riskLevel?: RiskLevel; // Alias
  impact_scale_ratings: Json;
  impactScaleRatings?: Json | Record<string, RiskLevel>; // Alias
  threat_id?: string;
  threatId?: string; // Alias
  vulnerability_id?: string;
  vulnerabilityId?: string; // Alias
  
  // Additional fields for residual risk
  residual_impact?: RiskLevel;
  residualImpact?: RiskLevel; // Alias
  residual_likelihood?: RiskLevel;
  residualLikelihood?: RiskLevel; // Alias
  residual_risk_level?: RiskLevel;
  residualRiskLevel?: RiskLevel; // Alias
  
  // Security measures fields
  security_measures?: string;
  securityMeasures?: string; // Alias
  measure_effectiveness?: string;
  measureEffectiveness?: string; // Alias
  
  // Handle both raw and mapped fields
  rawImpact?: RiskLevel;
  rawLikelihood?: RiskLevel;
  rawRiskLevel?: RiskLevel;
}
