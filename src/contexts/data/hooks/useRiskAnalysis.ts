
import { useState, useCallback } from 'react';
import { 
  RiskAsset, 
  RiskThreat, 
  RiskVulnerability, 
  RiskScenario, 
  RiskTreatment, 
  RiskLevel 
} from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRiskAnalysis = () => {
  const [riskAssets, setRiskAssets] = useState<RiskAsset[]>([]);
  const [riskThreats, setRiskThreats] = useState<RiskThreat[]>([]);
  const [riskVulnerabilities, setRiskVulnerabilities] = useState<RiskVulnerability[]>([]);
  const [riskScenarios, setRiskScenarios] = useState<RiskScenario[]>([]);
  const [riskTreatments, setRiskTreatments] = useState<RiskTreatment[]>([]);
  const [loading, setLoading] = useState({
    riskAssets: false,
    riskThreats: false,
    riskVulnerabilities: false,
    riskScenarios: false,
    riskTreatments: false
  });
  const { toast } = useToast();

  // Fetch risk assets by company ID
  const fetchRiskAssetsByCompanyId = useCallback(async (companyId: string): Promise<RiskAsset[]> => {
    setLoading(prev => ({ ...prev, riskAssets: true }));
    try {
      const { data, error } = await supabase
        .from('risk_assets')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      
      if (error) {
        console.error('Error fetching risk assets:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les actifs",
          variant: "destructive",
        });
        return [];
      }
      
      const fetchedAssets = data || [];
      setRiskAssets(fetchedAssets);
      return fetchedAssets;
    } catch (error) {
      console.error('Error fetching risk assets:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskAssets: false }));
    }
  }, [toast]);

  // Fetch risk threats by company ID
  const fetchRiskThreatsByCompanyId = useCallback(async (companyId: string): Promise<RiskThreat[]> => {
    setLoading(prev => ({ ...prev, riskThreats: true }));
    try {
      const { data, error } = await supabase
        .from('risk_threats')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      
      if (error) {
        console.error('Error fetching risk threats:', error);
        return [];
      }
      
      const fetchedThreats = data || [];
      setRiskThreats(fetchedThreats);
      return fetchedThreats;
    } catch (error) {
      console.error('Error fetching risk threats:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskThreats: false }));
    }
  }, []);

  // Fetch risk vulnerabilities by company ID
  const fetchRiskVulnerabilitiesByCompanyId = useCallback(async (companyId: string): Promise<RiskVulnerability[]> => {
    setLoading(prev => ({ ...prev, riskVulnerabilities: true }));
    try {
      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      
      if (error) {
        console.error('Error fetching risk vulnerabilities:', error);
        return [];
      }
      
      const fetchedVulnerabilities = data || [];
      setRiskVulnerabilities(fetchedVulnerabilities);
      return fetchedVulnerabilities;
    } catch (error) {
      console.error('Error fetching risk vulnerabilities:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskVulnerabilities: false }));
    }
  }, []);

  // Fetch risk scenarios by company ID
  const fetchRiskScenariosByCompanyId = useCallback(async (companyId: string): Promise<RiskScenario[]> => {
    setLoading(prev => ({ ...prev, riskScenarios: true }));
    try {
      const { data, error } = await supabase
        .from('risk_scenarios')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      
      if (error) {
        console.error('Error fetching risk scenarios:', error);
        return [];
      }
      
      const fetchedScenarios = data || [];
      setRiskScenarios(fetchedScenarios);
      return fetchedScenarios;
    } catch (error) {
      console.error('Error fetching risk scenarios:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskScenarios: false }));
    }
  }, []);

  // Fetch risk treatments by scenario ID
  const fetchRiskTreatmentsByScenarioId = useCallback(async (scenarioId: string): Promise<RiskTreatment[]> => {
    setLoading(prev => ({ ...prev, riskTreatments: true }));
    try {
      const { data, error } = await supabase
        .from('risk_treatments')
        .select('*')
        .eq('risk_scenario_id', scenarioId)
        .order('created_at');
      
      if (error) {
        console.error('Error fetching risk treatments:', error);
        return [];
      }
      
      const fetchedTreatments = data || [];
      setRiskTreatments(fetchedTreatments);
      return fetchedTreatments;
    } catch (error) {
      console.error('Error fetching risk treatments:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskTreatments: false }));
    }
  }, []);

  // Add a risk asset
  const addRiskAsset = useCallback(async (asset: Omit<RiskAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskAsset> => {
    try {
      const { data, error } = await supabase
        .from('risk_assets')
        .insert([asset])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk asset:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'actif",
          variant: "destructive",
        });
        throw new Error(error.message);
      }
      
      setRiskAssets(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Actif ajouté avec succès",
      });
      return data;
    } catch (error) {
      console.error('Error adding risk asset:', error);
      throw error;
    }
  }, [toast]);

  // Add a risk threat
  const addRiskThreat = useCallback(async (threat: Omit<RiskThreat, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskThreat> => {
    try {
      const { data, error } = await supabase
        .from('risk_threats')
        .insert([threat])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk threat:', error);
        throw new Error(error.message);
      }
      
      setRiskThreats(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding risk threat:', error);
      throw error;
    }
  }, []);

  // Add a risk vulnerability
  const addRiskVulnerability = useCallback(async (vulnerability: Omit<RiskVulnerability, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskVulnerability> => {
    try {
      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .insert([vulnerability])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk vulnerability:', error);
        throw new Error(error.message);
      }
      
      setRiskVulnerabilities(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding risk vulnerability:', error);
      throw error;
    }
  }, []);

  // Add a risk scenario
  const addRiskScenario = useCallback(async (scenario: Omit<RiskScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskScenario> => {
    try {
      const { data, error } = await supabase
        .from('risk_scenarios')
        .insert([scenario])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk scenario:', error);
        throw new Error(error.message);
      }
      
      setRiskScenarios(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding risk scenario:', error);
      throw error;
    }
  }, []);

  // Add a risk treatment
  const addRiskTreatment = useCallback(async (treatment: Omit<RiskTreatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskTreatment> => {
    try {
      const { data, error } = await supabase
        .from('risk_treatments')
        .insert([treatment])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk treatment:', error);
        throw new Error(error.message);
      }
      
      setRiskTreatments(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding risk treatment:', error);
      throw error;
    }
  }, []);

  // Update a risk asset
  const updateRiskAsset = useCallback(async (id: string, asset: Partial<RiskAsset>): Promise<RiskAsset> => {
    try {
      const { data, error } = await supabase
        .from('risk_assets')
        .update(asset)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk asset:', error);
        throw new Error(error.message);
      }
      
      setRiskAssets(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Error updating risk asset:', error);
      throw error;
    }
  }, []);

  // Update a risk threat
  const updateRiskThreat = useCallback(async (id: string, threat: Partial<RiskThreat>): Promise<RiskThreat> => {
    try {
      const { data, error } = await supabase
        .from('risk_threats')
        .update(threat)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk threat:', error);
        throw new Error(error.message);
      }
      
      setRiskThreats(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Error updating risk threat:', error);
      throw error;
    }
  }, []);

  // Update a risk vulnerability
  const updateRiskVulnerability = useCallback(async (id: string, vulnerability: Partial<RiskVulnerability>): Promise<RiskVulnerability> => {
    try {
      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .update(vulnerability)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk vulnerability:', error);
        throw new Error(error.message);
      }
      
      setRiskVulnerabilities(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Error updating risk vulnerability:', error);
      throw error;
    }
  }, []);

  // Update a risk scenario
  const updateRiskScenario = useCallback(async (id: string, scenario: Partial<RiskScenario>): Promise<RiskScenario> => {
    try {
      const { data, error } = await supabase
        .from('risk_scenarios')
        .update(scenario)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk scenario:', error);
        throw new Error(error.message);
      }
      
      setRiskScenarios(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Error updating risk scenario:', error);
      throw error;
    }
  }, []);

  // Update a risk treatment
  const updateRiskTreatment = useCallback(async (id: string, treatment: Partial<RiskTreatment>): Promise<RiskTreatment> => {
    try {
      const { data, error } = await supabase
        .from('risk_treatments')
        .update(treatment)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk treatment:', error);
        throw new Error(error.message);
      }
      
      setRiskTreatments(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Error updating risk treatment:', error);
      throw error;
    }
  }, []);

  // Delete a risk asset
  const deleteRiskAsset = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_assets')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting risk asset:', error);
        throw new Error(error.message);
      }
      
      setRiskAssets(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk asset:', error);
      return false;
    }
  }, []);

  // Delete a risk threat
  const deleteRiskThreat = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_threats')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting risk threat:', error);
        throw new Error(error.message);
      }
      
      setRiskThreats(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk threat:', error);
      return false;
    }
  }, []);

  // Delete a risk vulnerability
  const deleteRiskVulnerability = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_vulnerabilities')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting risk vulnerability:', error);
        throw new Error(error.message);
      }
      
      setRiskVulnerabilities(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk vulnerability:', error);
      return false;
    }
  }, []);

  // Delete a risk scenario
  const deleteRiskScenario = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_scenarios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting risk scenario:', error);
        throw new Error(error.message);
      }
      
      setRiskScenarios(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk scenario:', error);
      return false;
    }
  }, []);

  // Delete a risk treatment
  const deleteRiskTreatment = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_treatments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting risk treatment:', error);
        throw new Error(error.message);
      }
      
      setRiskTreatments(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk treatment:', error);
      return false;
    }
  }, []);

  // Associate a risk scenario with an asset
  const associateRiskScenarioWithAsset = useCallback(async (scenarioId: string, assetId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_scenario_assets')
        .insert([{ risk_scenario_id: scenarioId, asset_id: assetId }]);
      
      if (error) {
        console.error('Error associating risk scenario with asset:', error);
        throw new Error(error.message);
      }
      
      return true;
    } catch (error) {
      console.error('Error associating risk scenario with asset:', error);
      return false;
    }
  }, []);

  // Remove a risk scenario-asset association
  const removeRiskScenarioAssetAssociation = useCallback(async (scenarioId: string, assetId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_scenario_assets')
        .delete()
        .eq('risk_scenario_id', scenarioId)
        .eq('asset_id', assetId);
      
      if (error) {
        console.error('Error removing risk scenario-asset association:', error);
        throw new Error(error.message);
      }
      
      return true;
    } catch (error) {
      console.error('Error removing risk scenario-asset association:', error);
      return false;
    }
  }, []);

  // Get assets associated with a risk scenario
  const getRiskScenarioAssets = useCallback(async (scenarioId: string): Promise<RiskAsset[]> => {
    try {
      const { data, error } = await supabase
        .from('risk_scenario_assets')
        .select('asset_id')
        .eq('risk_scenario_id', scenarioId);
      
      if (error) {
        console.error('Error getting risk scenario assets:', error);
        throw new Error(error.message);
      }
      
      const assetIds = data.map(item => item.asset_id);
      
      if (assetIds.length === 0) {
        return [];
      }
      
      const { data: assets, error: assetsError } = await supabase
        .from('risk_assets')
        .select('*')
        .in('id', assetIds);
      
      if (assetsError) {
        console.error('Error getting assets by IDs:', assetsError);
        throw new Error(assetsError.message);
      }
      
      return assets || [];
    } catch (error) {
      console.error('Error getting risk scenario assets:', error);
      return [];
    }
  }, []);

  return {
    riskAssets,
    riskThreats,
    riskVulnerabilities,
    riskScenarios,
    riskTreatments,
    fetchRiskAssetsByCompanyId,
    fetchRiskThreatsByCompanyId,
    fetchRiskVulnerabilitiesByCompanyId,
    fetchRiskScenariosByCompanyId,
    fetchRiskTreatmentsByScenarioId,
    addRiskAsset,
    addRiskThreat,
    addRiskVulnerability,
    addRiskScenario,
    addRiskTreatment,
    updateRiskAsset,
    updateRiskThreat,
    updateRiskVulnerability,
    updateRiskScenario,
    updateRiskTreatment,
    deleteRiskAsset,
    deleteRiskThreat,
    deleteRiskVulnerability,
    deleteRiskScenario,
    deleteRiskTreatment,
    associateRiskScenarioWithAsset,
    removeRiskScenarioAssetAssociation,
    getRiskScenarioAssets,
    loading
  };
};
