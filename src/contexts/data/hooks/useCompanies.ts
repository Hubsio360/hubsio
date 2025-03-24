
import { useState, useEffect } from 'react';
import { Company } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('Fetching companies...');
        const { data, error } = await supabase
          .from('companies')
          .select('*');
        
        if (error) {
          console.error('Error fetching companies:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les entreprises: " + error.message,
            variant: "destructive",
          });
          return;
        }

        console.log('Companies fetched successfully:', data);
        const formattedCompanies: Company[] = data.map(item => ({
          id: item.id,
          name: item.name,
          activity: item.activity || '',
          creationYear: item.creation_year,
          parentCompany: item.parent_company,
          marketScope: item.market_scope,
          lastAuditDate: item.last_audit_date,
        }));
        
        setCompanies(formattedCompanies);
      } catch (error) {
        console.error('Error in fetchCompanies:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des entreprises",
          variant: "destructive",
        });
      }
    };

    fetchCompanies();
  }, [toast]);

  const addCompany = async (company: Omit<Company, 'id'>): Promise<Company> => {
    try {
      console.log('Adding new company:', company);
      
      // Vérifier que l'utilisateur est authentifié
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Vous devez être connecté pour ajouter une entreprise");
      }
      
      // Préparer les données pour l'insertion
      const companyData = {
        name: company.name,
        activity: company.activity || null,
        creation_year: company.creationYear || null,
        parent_company: company.parentCompany || null,
        market_scope: company.marketScope || null,
        last_audit_date: company.lastAuditDate || null,
      };
      
      console.log('Prepared data for insertion:', companyData);
      
      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding company:', error);
        throw new Error(`Erreur lors de l'ajout de l'entreprise: ${error.message}`);
      }

      console.log('Company added successfully:', data);
      const newCompany: Company = {
        id: data.id,
        name: data.name,
        activity: data.activity || '',
        creationYear: data.creation_year,
        parentCompany: data.parent_company,
        marketScope: data.market_scope,
        lastAuditDate: data.last_audit_date,
      };

      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (error) {
      console.error('Error in addCompany:', error);
      throw error;
    }
  };

  const enrichCompanyData = async (companyId: string): Promise<Company> => {
    try {
      console.log('Enriching company data for ID:', companyId);
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
    } catch (error) {
      console.error('Error in enrichCompanyData:', error);
      throw error;
    }
  };

  const getCompanyById = (id: string): Company | undefined => {
    return companies.find((company) => company.id === id);
  };

  return {
    companies,
    addCompany,
    enrichCompanyData,
    getCompanyById,
  };
};
