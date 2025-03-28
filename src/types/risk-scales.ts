
export interface RiskScaleType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRiskScale {
  id: string;
  companyId: string;
  scaleTypeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  scaleType?: RiskScaleType;
  levels?: RiskScaleLevel[];
}

export interface RiskScaleLevel {
  id: string;
  companyRiskScaleId: string;
  levelValue: number;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskScaleWithLevels extends CompanyRiskScale {
  levels: RiskScaleLevel[];
  scaleType: RiskScaleType;
}
