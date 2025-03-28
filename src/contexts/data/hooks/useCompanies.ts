
import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/types';
import { supabase, checkAuth } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fonction pour récupérer les entreprises
  const fetchCompanies = useCallback(async () => {
    try {
      // Ne pas essayer de récupérer les données si l'utilisateur n'est pas authentifié
      if (!isAuthenticated) {
        console.log('Utilisateur non authentifié, report de la récupération des entreprises');
        setCompanies([]);
        setLoading(false);
        return [];
      }
      
      setLoading(true);
      console.log('Utilisateur authentifié, récupération des entreprises...');
      
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
        setLoading(false);
        return [];
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
      return formattedCompanies;
    } catch (error) {
      console.error('Error in fetchCompanies:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des entreprises",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  // Récupération des entreprises lorsque l'authentification change
  useEffect(() => {
    fetchCompanies();
  }, [isAuthenticated, fetchCompanies]);

  const addCompany = async (company: Omit<Company, 'id'>): Promise<Company> => {
    try {
      console.log('Adding new company:', company);
      
      // Vérifier que l'utilisateur est authentifié
      const session = await checkAuth();
      if (!session) {
        console.error('Tentative d\'ajout d\'entreprise sans authentification');
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
      console.log('Current auth session:', session);
      
      // Insérer la nouvelle entreprise
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

      // Mettre à jour le state avec la nouvelle entreprise
      setCompanies(prev => [...prev, newCompany]);
      
      // Rafraîchir la liste complète pour s'assurer de la cohérence des données
      // Fixed: Converting PromiseLike to Promise with Promise.resolve()
      await Promise.resolve(fetchCompanies())
        .catch(error => {
          console.error('Error refreshing companies after add:', error);
        });
      
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

          // Mise à jour dans la base de données
          supabase
            .from('companies')
            .update({
              activity: enrichedData.activity,
              creation_year: enrichedData.creationYear,
              market_scope: enrichedData.marketScope
            })
            .eq('id', companyId)
            .then(() => {
              // Mise à jour du state local
              const newCompanies = [...companies];
              newCompanies[companyIndex] = enrichedCompany;
              setCompanies(newCompanies);
              
              // Rafraîchir la liste complète
              // Fix: Convert PromiseLike to a proper Promise and handle it correctly
              const fetchPromise = fetchCompanies();
              // Use async/await in Promise executor to handle properly
              Promise.resolve(fetchPromise)
                .then(() => {
                  resolve(enrichedCompany);
                })
                .catch((error) => {
                  console.error('Error refreshing companies after enrich:', error);
                  reject(error);
                });
            })
            .catch(error => {
              console.error('Error updating enriched company data:', error);
              reject(error);
            });
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
    loading,
    fetchCompanies,
    addCompany,
    enrichCompanyData,
    getCompanyById,
  };
};
