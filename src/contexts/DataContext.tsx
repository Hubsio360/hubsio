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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface DataContextProps {
  companies: Company[];
  audits: Audit[];
  frameworks: Framework[];
  controls: FrameworkControl[];
  auditSteps: AuditStep[];
  findings: Finding[];
  loading: {
    frameworks: boolean;
    controls: boolean;
  };
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
  const [audits, setAudits] = useState<Audit[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [controls, setControls] = useState<FrameworkControl[]>([]);
  const [auditSteps, setAuditSteps] = useState<AuditStep[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState({
    frameworks: true,
    controls: true
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchFrameworks() {
      try {
        setLoading(prev => ({ ...prev, frameworks: true }));
        const { data, error } = await supabase
          .from('frameworks')
          .select('*');
        
        if (error) {
          console.error('Error fetching frameworks:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les référentiels",
            variant: "destructive",
          });
          return;
        }

        const formattedFrameworks: Framework[] = data.map(item => ({
          id: item.id,
          name: item.name,
          version: item.version
        }));
        
        setFrameworks(formattedFrameworks);
      } catch (error) {
        console.error('Error in fetchFrameworks:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des référentiels",
          variant: "destructive",
        });
      } finally {
        setLoading(prev => ({ ...prev, frameworks: false }));
      }
    }

    async function fetchControls() {
      try {
        setLoading(prev => ({ ...prev, controls: true }));
        const { data, error } = await supabase
          .from('framework_controls')
          .select('*');
        
        if (error) {
          console.error('Error fetching controls:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les contrôles",
            variant: "destructive",
          });
          return;
        }

        const formattedControls: FrameworkControl[] = data.map(item => ({
          id: item.id,
          frameworkId: item.framework_id,
          referenceCode: item.reference_code,
          title: item.title,
          description: item.description || ''
        }));
        
        setControls(formattedControls);
      } catch (error) {
        console.error('Error in fetchControls:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des contrôles",
          variant: "destructive",
        });
      } finally {
        setLoading(prev => ({ ...prev, controls: false }));
      }
    }

    fetchFrameworks();
    fetchControls();
  }, [toast]);

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

        const company = companies[companyIndex];
        
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
    try {
      const { data: frameworkData, error: frameworkError } = await supabase
        .from('frameworks')
        .insert({
          name: frameworkData.name,
          version: frameworkData.version
        })
        .select()
        .single();
      
      if (frameworkError) {
        console.error('Error inserting framework:', frameworkError);
        throw new Error(`Erreur lors de l'insertion du référentiel: ${frameworkError.message}`);
      }

      const newFramework: Framework = {
        id: frameworkData.id,
        name: frameworkData.name,
        version: frameworkData.version,
      };
      
      const controlsToInsert = frameworkData.controls.map(control => ({
        framework_id: newFramework.id,
        reference_code: control.referenceCode,
        title: control.title,
        description: control.description,
      }));
      
      const { data: controlsData, error: controlsError } = await supabase
        .from('framework_controls')
        .insert(controlsToInsert)
        .select();
      
      if (controlsError) {
        console.error('Error inserting controls:', controlsError);
        throw new Error(`Erreur lors de l'insertion des contrôles: ${controlsError.message}`);
      }
      
      const newControls: FrameworkControl[] = controlsData.map(control => ({
        id: control.id,
        frameworkId: control.framework_id,
        referenceCode: control.reference_code,
        title: control.title,
        description: control.description || '',
      }));
      
      setFrameworks(prev => [...prev, newFramework]);
      setControls(prev => [...prev, ...newControls]);
      
      return {
        framework: newFramework,
        controlsCount: newControls.length,
      };
    } catch (error) {
      console.error('Error in importFramework:', error);
      throw error;
    }
  };

  const updateFramework = async (
    id: string,
    updates: Partial<Framework>
  ): Promise<Framework> => {
    try {
      const dbUpdates = {
        ...(updates.name && { name: updates.name }),
        ...(updates.version && { version: updates.version })
      };

      const { data, error } = await supabase
        .from('frameworks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating framework:', error);
        throw new Error(`Erreur lors de la mise à jour du référentiel: ${error.message}`);
      }

      const updatedFramework: Framework = {
        id: data.id,
        name: data.name,
        version: data.version,
      };

      setFrameworks(prev => prev.map(f => 
        f.id === id ? updatedFramework : f
      ));

      return updatedFramework;
    } catch (error) {
      console.error('Error in updateFramework:', error);
      throw error;
    }
  };

  const deleteFramework = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('frameworks')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting framework:', error);
        throw new Error(`Erreur lors de la suppression du référentiel: ${error.message}`);
      }

      setFrameworks(prev => prev.filter(f => f.id !== id));
      setControls(prev => prev.filter(c => c.frameworkId !== id));
      
    } catch (error) {
      console.error('Error in deleteFramework:', error);
      throw error;
    }
  };

  const updateControl = async (
    id: string,
    updates: Partial<FrameworkControl>
  ): Promise<FrameworkControl> => {
    try {
      const dbUpdates = {
        ...(updates.referenceCode && { reference_code: updates.referenceCode }),
        ...(updates.title && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description })
      };

      const { data, error } = await supabase
        .from('framework_controls')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating control:', error);
        throw new Error(`Erreur lors de la mise à jour du contrôle: ${error.message}`);
      }

      const updatedControl: FrameworkControl = {
        id: data.id,
        frameworkId: data.framework_id,
        referenceCode: data.reference_code,
        title: data.title,
        description: data.description || '',
      };

      setControls(prev => prev.map(c => 
        c.id === id ? updatedControl : c
      ));

      return updatedControl;
    } catch (error) {
      console.error('Error in updateControl:', error);
      throw error;
    }
  };

  const addControl = async (
    control: Omit<FrameworkControl, 'id'>
  ): Promise<FrameworkControl> => {
    try {
      const dbControl = {
        framework_id: control.frameworkId,
        reference_code: control.referenceCode,
        title: control.title,
        description: control.description || null
      };

      const { data, error } = await supabase
        .from('framework_controls')
        .insert(dbControl)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding control:', error);
        throw new Error(`Erreur lors de l'ajout du contrôle: ${error.message}`);
      }

      const newControl: FrameworkControl = {
        id: data.id,
        frameworkId: data.framework_id,
        referenceCode: data.reference_code,
        title: data.title,
        description: data.description || '',
      };

      setControls(prev => [...prev, newControl]);

      return newControl;
    } catch (error) {
      console.error('Error in addControl:', error);
      throw error;
    }
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
        loading,
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
