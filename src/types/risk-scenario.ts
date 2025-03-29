
import { RiskLevel } from '@/types';
import { Json } from './supabase';

export interface RiskScenario {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  impact_description?: string;
  status: 'identified' | 'analyzed' | 'treated' | 'accepted' | 'monitored';
  scope: 'organization' | 'system' | 'service' | 'process';
  created_at: string;
  updated_at: string;
  impact_level: RiskLevel;
  likelihood: RiskLevel;
  risk_level: RiskLevel;
  impact_scale_ratings: Json;
  threat_id?: string;
  vulnerability_id?: string;
  // Add the missing fields needed by RiskScenarioDetail
  residual_impact: RiskLevel;
  residual_likelihood: RiskLevel;
  residual_risk_level: RiskLevel;
  security_measures?: string;
  measure_effectiveness?: string;
}
