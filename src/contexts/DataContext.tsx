import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Company, 
  Audit, 
  Framework, 
  FrameworkControl, 
  AuditStep,
  Finding,
  User,
  FrameworkImport,
  FrameworkImportResult
} from '@/types';

// Données mock pour le développement
const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'TechSecure SAS',
    activity: 'Développement logiciel sécurisé',
    creationYear: 2015,
    marketScope: 'National',
    lastAuditDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'DataProtect',
    activity: 'Protection des données et RGPD',
    creationYear: 2018,
    parentCompany: 'CyberGroup International',
    marketScope: 'Europe',
    lastAuditDate: '2023-09-22',
  },
  {
    id: '3',
    name: 'SecureCloud',
    activity: 'Services d\'hébergement sécurisés',
    creationYear: 2016,
    marketScope: 'International',
    lastAuditDate: '2023-10-05',
  },
  {
    id: '4',
    name: 'Cyber Defense Labs',
    activity: 'Recherche en cybersécurité',
    creationYear: 2019,
    marketScope: 'International',
    lastAuditDate: '2023-11-12',
  },
  {
    id: '5',
    name: 'FinSafe Solutions',
    activity: 'Sécurité des transactions financières',
    creationYear: 2017,
    parentCompany: 'FinTech Group',
    marketScope: 'National',
  },
];

const MOCK_FRAMEWORKS: Framework[] = [
  {
    id: '1',
    name: 'ISO 27001',
    version: '2022',
  },
  {
    id: '2',
    name: 'NIST Cybersecurity Framework',
    version: '1.1',
  },
  {
    id: '3',
    name: 'PCI DSS',
    version: '4.0',
  },
];

const MOCK_CONTROLS: FrameworkControl[] = [
  {
    id: '1',
    frameworkId: '1',
    referenceCode: 'A.5.1',
    title: 'Politiques de sécurité de l\'information',
    description: 'Fournir des directives et un soutien à la gestion de la sécurité de l\'information conformément aux exigences de l\'entreprise et aux lois et règlements en vigueur.',
  },
  {
    id: '2',
    frameworkId: '1',
    referenceCode: 'A.5.2',
    title: 'Revue des politiques de sécurité de l\'information',
    description: 'Les politiques de sécurité de l\'information doivent être revues à intervalles planifiés ou en cas de changements importants pour assurer leur adéquation, leur pertinence et leur efficacité continues.',
  },
  {
    id: '3',
    frameworkId: '1',
    referenceCode: 'A.6.1.1',
    title: 'Rôles et responsabilités en matière de sécurité',
    description: 'Toutes les responsabilités en matière de sécurité de l\'information doivent être définies et attribuées.',
  },
  {
    id: '4',
    frameworkId: '1',
    referenceCode: 'A.8.1.1',
    title: 'Inventaire des actifs',
    description: 'Les actifs associés à l\'information et aux moyens de traitement de l\'information doivent être identifiés et un inventaire de ces actifs doit être établi et tenu à jour.',
  },
  {
    id: '5',
    frameworkId: '1',
    referenceCode: 'A.9.2.1',
    title: 'Enregistrement et désinscription des utilisateurs',
    description: 'Un processus formel d\'enregistrement et de désinscription des utilisateurs doit être mis en œuvre pour permettre l\'attribution des droits d\'accès.',
  },
];

const MOCK_AUDITS: Audit[] = [
  {
    id: '1',
    companyId: '1',
    frameworkId: '1',
    startDate: '2023-06-10',
    endDate: '2023-06-15',
    scope: 'Systèmes d\'information centraux',
    createdById: '2',
    status: 'completed',
  },
  {
    id: '2',
    companyId: '2',
    frameworkId: '1',
    startDate: '2023-09-18',
    endDate: '2023-09-22',
    scope: 'Traitement des données clients',
    createdById: '2',
    status: 'completed',
  },
  {
    id: '3',
    companyId: '3',
    frameworkId: '1',
    startDate: '2023-10-02',
    endDate: '2023-10-05',
    scope: 'Infrastructure cloud',
    createdById: '2',
    status: 'completed',
  },
  {
    id: '4',
    companyId: '4',
    frameworkId: '1',
    startDate: '2023-11-08',
    endDate: '2023-11-12',
    scope: 'Laboratoires de recherche',
    createdById: '2',
    status: 'completed',
  },
  {
    id: '5',
    companyId: '1',
    frameworkId: '1',
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    scope: 'Nouvelle application de paiement',
    createdById: '2',
    status: 'in_progress',
  },
];

const MOCK_AUDIT_STEPS: AuditStep[] = [
  {
    id: '1',
    auditId: '5',
    title: 'Revue des politiques de sécurité',
    description: 'Évaluation des politiques et procédures de sécurité de l\'information',
    order: 1,
    controlIds: ['1', '2'],
  },
  {
    id: '2',
    auditId: '5',
    title: 'Évaluation de la gouvernance',
    description: 'Analyse de la structure organisationnelle et des responsabilités',
    order: 2,
    controlIds: ['3'],
  },
  {
    id: '3',
    auditId: '5',
    title: 'Gestion des actifs',
    description: 'Vérification des inventaires et de la classification des actifs',
    order: 3,
    controlIds: ['4'],
  },
  {
    id: '4',
    auditId: '5',
    title: 'Contrôle d\'accès',
    description: 'Évaluation des mécanismes de contrôle d\'accès',
    order: 4,
    controlIds: ['5'],
  },
];

const MOCK_FINDINGS: Finding[] = [
  {
    id: '1',
    auditStepId: '1',
    controlId: '1',
    authorId: '2',
    rawText: 'J\'ai constaté que la politique de sécurité n\'a pas été mise à jour depuis 2 ans alors que beaucoup de changements ont eu lieu dans l\'organisation',
    refinedText: 'La politique de sécurité de l\'information n\'a pas été révisée depuis plus de 24 mois, malgré des changements organisationnels significatifs survenus pendant cette période.',
    category: 'non_conformity_minor',
    status: 'validated',
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-16T09:15:00Z',
  },
  {
    id: '2',
    auditStepId: '2',
    controlId: '3',
    authorId: '2',
    rawText: 'Les rôles et responsabilités en matière de sécurité sont clairement définis dans l\'organigramme mais ne sont pas connus par tous les employés interrogés',
    refinedText: 'L\'organigramme de sécurité définit clairement les rôles et responsabilités, mais une connaissance insuffisante de ces attributions a été constatée lors des entretiens avec le personnel.',
    category: 'sensitive_point',
    status: 'pending_review',
    createdAt: '2024-03-16T11:45:00Z',
    updatedAt: '2024-03-16T11:45:00Z',
  },
  {
    id: '3',
    auditStepId: '3',
    controlId: '4',
    authorId: '2',
    rawText: 'L\'inventaire des actifs n\'est pas complet, il manque les nouveaux serveurs acquis en janvier',
    status: 'draft',
    category: 'non_conformity_minor',
    createdAt: '2024-03-17T10:20:00Z',
    updatedAt: '2024-03-17T10:20:00Z',
  },
];

interface DataContextProps {
  companies: Company[];
  audits: Audit[];
  frameworks: Framework[];
  controls: FrameworkControl[];
  auditSteps: AuditStep[];
  findings: Finding[];
  addCompany: (company: Omit<Company, 'id'>) => Promise<Company>;
  addAudit: (audit: Omit<Audit, 'id'>) => Promise<Audit>;
  addFinding: (finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Finding>;
  updateFinding: (id: string, updates: Partial<Finding>) => Promise<Finding>;
  enrichCompanyData: (companyId: string) => Promise<Company>;
  getAuditsByCompanyId: (companyId: string) => Audit[];
  getFindingsByAuditStepId: (auditStepId: string) => Finding[];
  getAuditStepsByAuditId: (auditId: string) => AuditStep[];
  getCompanyById: (id: string) => Company | undefined;
  getAuditById: (id: string) => Audit | undefined;
  getFrameworkById: (id: string) => Framework | undefined;
  getControlById: (id: string) => FrameworkControl | undefined;
  importFramework: (frameworkData: FrameworkImport) => Promise<FrameworkImportResult>;
  updateFramework: (id: string, updates: Partial<Framework>) => Promise<Framework>;
  deleteFramework: (id: string) => Promise<void>;
  updateControl: (id: string, updates: Partial<FrameworkControl>) => Promise<FrameworkControl>;
  addControl: (control: Omit<FrameworkControl, 'id'>) => Promise<FrameworkControl>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [audits, setAudits] = useState<Audit[]>(MOCK_AUDITS);
  const [frameworks, setFrameworks] = useState<Framework[]>(MOCK_FRAMEWORKS);
  const [controls, setControls] = useState<FrameworkControl[]>(MOCK_CONTROLS);
  const [auditSteps, setAuditSteps] = useState<AuditStep[]>(MOCK_AUDIT_STEPS);
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);

  const addCompany = async (company: Omit<Company, 'id'>): Promise<Company> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCompany = {
          ...company,
          id: `company-${Date.now()}`,
        };
        setCompanies((prev) => [...prev, newCompany]);
        resolve(newCompany);
      }, 500);
    });
  };

  const addAudit = async (audit: Omit<Audit, 'id'>): Promise<Audit> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAudit = {
          ...audit,
          id: `audit-${Date.now()}`,
        };
        setAudits((prev) => [...prev, newAudit]);
        resolve(newAudit);
      }, 500);
    });
  };

  const addFinding = async (
    finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Finding> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString();
        const newFinding = {
          ...finding,
          id: `finding-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        setFindings((prev) => [...prev, newFinding]);
        resolve(newFinding);
      }, 500);
    });
  };

  const updateFinding = async (
    id: string,
    updates: Partial<Finding>
  ): Promise<Finding> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const findingIndex = findings.findIndex((f) => f.id === id);
        if (findingIndex === -1) {
          return reject(new Error('Finding not found'));
        }

        const updatedFinding = {
          ...findings[findingIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const newFindings = [...findings];
        newFindings[findingIndex] = updatedFinding;
        setFindings(newFindings);
        resolve(updatedFinding);
      }, 500);
    });
  };

  const enrichCompanyData = async (companyId: string): Promise<Company> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const companyIndex = companies.findIndex((c) => c.id === companyId);
        if (companyIndex === -1) {
          return reject(new Error('Company not found'));
        }

        // Simuler une enrichissement par IA
        const company = companies[companyIndex];
        
        // Générer des informations enrichies en fonction du nom
        const enrichedData = {
          activity: company.activity || `${company.name} se spécialise dans la fourniture de solutions de cybersécurité avancées.`,
          creationYear: company.creationYear || 2018,
          marketScope: company.marketScope || 'National',
        };

        const enrichedCompany = {
          ...company,
          ...enrichedData,
        };

        const newCompanies = [...companies];
        newCompanies[companyIndex] = enrichedCompany;
        setCompanies(newCompanies);
        resolve(enrichedCompany);
      }, 1000);
    });
  };

  const importFramework = async (frameworkData: FrameworkImport): Promise<FrameworkImportResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Créer un nouveau framework
        const newFramework: Framework = {
          id: `framework-${Date.now()}`,
          name: frameworkData.name,
          version: frameworkData.version,
        };
        
        // Créer les nouveaux contrôles
        const newControls: FrameworkControl[] = frameworkData.controls.map((control, index) => ({
          id: `control-${Date.now()}-${index}`,
          frameworkId: newFramework.id,
          referenceCode: control.referenceCode,
          title: control.title,
          description: control.description,
        }));
        
        // Mettre à jour l'état
        setFrameworks((prev) => [...prev, newFramework]);
        setControls((prev) => [...prev, ...newControls]);
        
        // Retourner le résultat
        resolve({
          framework: newFramework,
          controlsCount: newControls.length,
        });
      }, 1000);
    });
  };

  const updateFramework = async (
    id: string,
    updates: Partial<Framework>
  ): Promise<Framework> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const frameworkIndex = frameworks.findIndex((f) => f.id === id);
        if (frameworkIndex === -1) {
          return reject(new Error('Framework not found'));
        }

        const updatedFramework = {
          ...frameworks[frameworkIndex],
          ...updates,
        };

        const newFrameworks = [...frameworks];
        newFrameworks[frameworkIndex] = updatedFramework;
        setFrameworks(newFrameworks);
        resolve(updatedFramework);
      }, 500);
    });
  };

  const deleteFramework = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("Suppression du référentiel avec ID:", id);
        
        const frameworkIndex = frameworks.findIndex((f) => f.id === id);
        if (frameworkIndex === -1) {
          console.error("Framework not found avec ID:", id);
          return reject(new Error('Framework not found'));
        }

        console.log("Framework trouvé à l'index:", frameworkIndex);
        console.log("Frameworks avant suppression:", frameworks);
        
        // Important: Create new arrays for state updates to ensure React detects the change
        const newFrameworks = frameworks.filter((f) => f.id !== id);
        const newControls = controls.filter((c) => c.frameworkId !== id);
        
        console.log("Frameworks après filtrage:", newFrameworks);
        
        // Update state with the new arrays
        setFrameworks(newFrameworks);
        setControls(newControls);
        
        console.log("État frameworks après setFrameworks:", newFrameworks);
        console.log("Contrôles après suppression des contrôles associés:", newControls);

        // Make sure any audits using this framework are also updated
        // This is optional but would ensure complete data consistency
        const auditsUsingFramework = audits.filter(a => a.frameworkId === id);
        if (auditsUsingFramework.length > 0) {
          console.log("Audits utilisant ce référentiel:", auditsUsingFramework.length);
          // You may want to handle this case based on your application's needs
        }

        resolve();
      }, 500);
    });
  };

  const updateControl = async (
    id: string,
    updates: Partial<FrameworkControl>
  ): Promise<FrameworkControl> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const controlIndex = controls.findIndex((c) => c.id === id);
        if (controlIndex === -1) {
          return reject(new Error('Control not found'));
        }

        const updatedControl = {
          ...controls[controlIndex],
          ...updates,
        };

        const newControls = [...controls];
        newControls[controlIndex] = updatedControl;
        setControls(newControls);
        resolve(updatedControl);
      }, 500);
    });
  };

  const addControl = async (
    control: Omit<FrameworkControl, 'id'>
  ): Promise<FrameworkControl> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newControl = {
          ...control,
          id: `control-${Date.now()}`,
        };
        setControls((prev) => [...prev, newControl]);
        resolve(newControl);
      }, 500);
    });
  };

  const getAuditsByCompanyId = (companyId: string): Audit[] => {
    return audits.filter((audit) => audit.companyId === companyId);
  };

  const getFindingsByAuditStepId = (auditStepId: string): Finding[] => {
    return findings.filter((finding) => finding.auditStepId === auditStepId);
  };

  const getAuditStepsByAuditId = (auditId: string): AuditStep[] => {
    return auditSteps
      .filter((step) => step.auditId === auditId)
      .sort((a, b) => a.order - b.order);
  };

  const getCompanyById = (id: string): Company | undefined => {
    return companies.find((company) => company.id === id);
  };

  const getAuditById = (id: string): Audit | undefined => {
    return audits.find((audit) => audit.id === id);
  };

  const getFrameworkById = (id: string): Framework | undefined => {
    return frameworks.find((framework) => framework.id === id);
  };

  const getControlById = (id: string): FrameworkControl | undefined => {
    return controls.find((control) => control.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        companies,
        audits,
        frameworks,
        controls,
        auditSteps,
        findings,
        addCompany,
        addAudit,
        addFinding,
        updateFinding,
        enrichCompanyData,
        getAuditsByCompanyId,
        getFindingsByAuditStepId,
        getAuditStepsByAuditId,
        getCompanyById,
        getAuditById,
        getFrameworkById,
        getControlById,
        importFramework,
        updateFramework,
        deleteFramework,
        updateControl,
        addControl,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
