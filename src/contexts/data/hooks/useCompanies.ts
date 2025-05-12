
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types';
import { useState, useCallback } from 'react';

interface AddCompanyParams {
  name: string;
  activity?: string;
  parentCompany?: string;
  marketScope?: string;
  creationYear?: number;
}

export function useCompanies() {
  const [loading, setLoading] = useState<boolean | Record<string, boolean>>(false);
  const [error, setError] = useState<null | Error>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchCompanies = useCallback(async () => {
    setLoading(prev => typeof prev === 'boolean' ? true : { ...prev, companies: true });
    setError(null);
    
    console.log('Utilisateur authentifié, récupération des entreprises...');
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Companies fetched successfully:', data);
      
      // Convert database format to frontend format
      const formattedCompanies: Company[] = data?.map(company => ({
        id: company.id,
        name: company.name,
        activity: company.activity || '',
        creationYear: company.creation_year,
        parentCompany: company.parent_company,
        marketScope: company.market_scope,
        lastAuditDate: company.last_audit_date,
      })) || [];
      
      setCompanies(formattedCompanies);
      return formattedCompanies;
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err);
      return [];
    } finally {
      setLoading(prev => typeof prev === 'boolean' ? false : { ...prev, companies: false });
    }
  }, []);

  const getCompanyById = useCallback((id: string): Company | undefined => {
    return companies.find(company => company.id === id);
  }, [companies]);

  const addCompany = useCallback(async (companyData: AddCompanyParams): Promise<Company> => {
    setLoading(prev => typeof prev === 'boolean' ? true : { ...prev, addCompany: true });
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          activity: companyData.activity || null,
          parent_company: companyData.parentCompany || null,
          market_scope: companyData.marketScope || null,
          creation_year: companyData.creationYear || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
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
      
      setCompanies(prevCompanies => [newCompany, ...prevCompanies]);
      
      return newCompany;
    } catch (err: any) {
      console.error('Error adding company:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(prev => typeof prev === 'boolean' ? false : { ...prev, addCompany: false });
    }
  }, []);

  const enrichCompanyData = useCallback(async (companyId: string): Promise<Company | null> => {
    setLoading(prev => typeof prev === 'boolean' ? true : { ...prev, enrichCompany: true });
    setError(null);
    
    try {
      console.log('Enriching company data for ID:', companyId);
      
      // Trouver l'entreprise actuelle pour obtenir son nom
      const company = companies.find(c => c.id === companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Appeler l'edge function pour enrichir les données de l'entreprise
      const response = await supabase.functions.invoke('enrich-company', {
        body: {
          companyId: companyId,
          companyName: company.name,
          description: company.activity
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error enriching company data');
      }

      const enrichedData = response.data.data;
      
      // Mettre à jour l'entreprise avec les données enrichies
      const { data, error } = await supabase
        .from('companies')
        .update({
          activity: enrichedData.activity || null,
          creation_year: enrichedData.creationYear || null,
          parent_company: enrichedData.parentCompany || null,
          market_scope: enrichedData.marketScope || null,
        })
        .eq('id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Formater les données pour le frontend
      const updatedCompany: Company = {
        id: data.id,
        name: data.name,
        activity: data.activity || '',
        creationYear: data.creation_year,
        parentCompany: data.parent_company,
        marketScope: data.market_scope,
        lastAuditDate: data.last_audit_date,
      };
      
      // Mettre à jour le state local
      setCompanies(prevCompanies => 
        prevCompanies.map(c => c.id === companyId ? updatedCompany : c)
      );
      
      return updatedCompany;
    } catch (err: any) {
      console.error('Error enriching company data:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(prev => typeof prev === 'boolean' ? false : { ...prev, enrichCompany: false });
    }
  }, [companies]);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    addCompany,
    enrichCompanyData,
    getCompanyById,
  };
}
