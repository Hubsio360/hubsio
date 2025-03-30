
import { RiskLevel } from './index';

export interface RiskScaleType {
  id: string;
  name: string;
  description: string;
  category?: 'impact' | 'likelihood' | string;
  createdAt?: string;
  updatedAt?: string;
  // Database field mappings
  created_at?: string;
  updated_at?: string;
}

export interface CompanyRiskScale {
  id: string;
  companyId?: string;
  scaleTypeId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  scaleType?: RiskScaleType;
  levels?: RiskScaleLevel[];
  // Database field mappings
  company_id?: string;
  scale_type_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  risk_scale_types?: RiskScaleType;
}

export interface RiskScaleLevel {
  id: string;
  companyRiskScaleId?: string;
  levelValue?: number;
  name: string;
  description: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
  // Database field mappings
  company_risk_scale_id?: string;
  level_value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RiskScaleWithLevels extends CompanyRiskScale {
  levels: RiskScaleLevel[];
  scaleType: RiskScaleType;
}

export interface RiskAssessment {
  rawLikelihood: RiskLevel;
  rawImpact: RiskLevel;
  rawRiskLevel: RiskLevel;
  residualLikelihood: RiskLevel;
  residualImpact: RiskLevel;
  residualRiskLevel: RiskLevel;
  securityMeasures: string;
  measureEffectiveness: string;
  // Database field mappings
  raw_likelihood?: RiskLevel;
  raw_impact?: RiskLevel;
  raw_risk_level?: RiskLevel;
  residual_likelihood?: RiskLevel;
  residual_impact?: RiskLevel;
  residual_risk_level?: RiskLevel;
  security_measures?: string;
  measure_effectiveness?: string;
}
