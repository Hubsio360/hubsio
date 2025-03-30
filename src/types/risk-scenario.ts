
import { RiskLevel } from '@/types';
import { Json } from './supabase';

export interface RiskScenario {
  id: string;
  company_id: string;
  companyId?: string; // Alias pour la cohérence
  name: string;
  description?: string;
  impact_description?: string;
  impactDescription?: string; // Alias pour la cohérence
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
  threat_id?: string;
  threatId?: string; // Alias
  vulnerability_id?: string;
  vulnerabilityId?: string; // Alias
  
  // Champs pour le risque résiduel
  residual_impact?: RiskLevel;
  residualImpact?: RiskLevel; // Alias
  residual_likelihood?: RiskLevel;
  residualLikelihood?: RiskLevel; // Alias
  residual_risk_level?: RiskLevel;
  residualRiskLevel?: RiskLevel; // Alias
  
  // Champs pour les mesures de sécurité
  security_measures?: string;
  securityMeasures?: string; // Alias
  measure_effectiveness?: string;
  measureEffectiveness?: string; // Alias
  
  // Champs pour les évaluations d'impact
  impact_scale_ratings?: Json | Record<string, RiskLevel>;
  impactScaleRatings?: Json | Record<string, RiskLevel>; // Alias
  
  // Champs bruts pour l'évaluation
  rawImpact?: RiskLevel;
  rawLikelihood?: RiskLevel;
  rawRiskLevel?: RiskLevel;
}
