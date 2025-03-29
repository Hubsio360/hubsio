
export interface RiskScaleType {
  id: string;
  name: string;
  description?: string;
  category: 'impact' | 'likelihood' | 'risk_level' | string;
  created_at: string;
  updated_at: string;
}

export interface RiskScaleLevel {
  id: string;
  company_risk_scale_id: string;
  name: string;
  description?: string;
  level_value: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyRiskScale {
  id: string;
  company_id: string;
  scale_type_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  levels?: RiskScaleLevel[];
  scale_type?: RiskScaleType;
}

export interface RiskScaleWithLevels extends CompanyRiskScale {
  levels: RiskScaleLevel[];
  scaleType: RiskScaleType;
}

export interface RiskAssessment {
  impact: string;
  likelihood: string;
  risk_level: string;
  impact_description?: string;
}
