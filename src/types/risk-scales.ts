export interface RiskScaleType {
  id: string;
  name: string;
  description: string;
  category?: 'impact' | 'likelihood';
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
