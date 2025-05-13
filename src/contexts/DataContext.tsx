
import React, { createContext, useContext } from 'react';
import { DataProvider } from './DataProvider';
import {
  Audit,
  Control,
  Framework,
  Topic,
  Theme,
  Company,
  User,
  StandardClause,
  Finding,
  Service,
  RiskAsset,
  RiskThreat,
  RiskVulnerability,
  RiskScenario,
  RiskScenarioTemplate,
  RiskScales,
  CompanyRiskScale,
} from '@/types';

interface DataContextType {
  // Companies
  companies: Company[];
  loading: boolean | Record<string, boolean>;
  error: Error | null;
  fetchCompanies: () => Promise<Company[]>;
  addCompany: (companyData: { name: string; activity?: string; parentCompany?: string; marketScope?: string; creationYear?: number; }) => Promise<Company>;
  updateCompany: (id: string, companyData: { name?: string; activity?: string; parentCompany?: string; marketScope?: string; creationYear?: number; }) => Promise<Company>;
  getCompanyById: (id: string) => Company | undefined;
  enrichCompanyData: (companyId: string, organizationContext?: string) => Promise<Company>;
  
  // Frameworks
  frameworks: Framework[];
  getFrameworkById: (id: string) => Framework | undefined;
  fetchFrameworks: () => Promise<Framework[]>;
  addFramework: (name: string, version: string) => Promise<Framework>;
  updateFramework: (id: string, name: string, version: string) => Promise<Framework>;
  deleteFramework: (id: string) => Promise<void>;
  
  // Controls
  controls: Control[];
  fetchControlsByFramework: (frameworkId: string) => Promise<Control[]>;
  addControl: (frameworkId: string, referenceCode: string, title: string, description?: string) => Promise<Control>;
  updateControl: (id: string, data: { referenceCode?: string; title?: string; description?: string }) => Promise<Control>;
  deleteControl: (id: string) => Promise<void>;
  
  // Standard clauses
  standardClauses: StandardClause[];
  fetchStandardClauses: () => Promise<StandardClause[]>;
  
  // Topics
  topics: Topic[];
  fetchTopics: () => Promise<Topic[]>;
  
  // Themes
  themes: Theme[];
  fetchThemes: () => Promise<Theme[]>;
  
  // Audits
  audits: Audit[];
  getAuditsByCompanyId: (companyId: string) => Audit[];
  fetchAudits: () => Promise<Audit[]>;
  addAudit: (companyId: string, frameworkId: string, startDate: string, endDate: string, createdById: string, scope?: string) => Promise<Audit>;
  updateAudit: (id: string, data: { startDate?: string; endDate?: string; status?: string; scope?: string }) => Promise<Audit>;
  deleteAudit: (id: string) => Promise<void>;
  
  // Findings
  findings: Finding[];
  fetchFindingsByAuditStep: (auditStepId: string) => Promise<Finding[]>;
  
  // Audit steps
  fetchAuditSteps: (auditId: string) => Promise<any[]>;
  
  // Services
  services: Service[];
  fetchServicesByCompanyId: (companyId: string) => Promise<Service[]>;
  
  // Users
  users: User[];
  fetchUsers: () => Promise<User[]>;
  
  // Risk assets
  riskAssets: RiskAsset[];
  fetchRiskAssetsByCompanyId: (companyId: string) => Promise<RiskAsset[]>;
  
  // Risk threats
  riskThreats: RiskThreat[];
  fetchRiskThreatsByCompanyId: (companyId: string) => Promise<RiskThreat[]>;
  
  // Risk vulnerabilities
  riskVulnerabilities: RiskVulnerability[];
  fetchRiskVulnerabilitiesByCompanyId: (companyId: string) => Promise<RiskVulnerability[]>;
  
  // Risk scenarios
  riskScenarios: RiskScenario[];
  fetchRiskScenariosByCompanyId: (companyId: string) => Promise<RiskScenario[]>;
  
  // Risk scenario templates
  riskScenarioTemplates: RiskScenarioTemplate[];
  fetchRiskScenarioTemplates: () => Promise<RiskScenarioTemplate[]>;

  // Risk scales
  riskScales: RiskScales;
  fetchCompanyRiskScales: (companyId: string) => Promise<CompanyRiskScale[]>;
  updateRiskScaleLevel: (levelId: string, data: { name?: string; description?: string; color?: string }) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export { DataContext, DataProvider };
