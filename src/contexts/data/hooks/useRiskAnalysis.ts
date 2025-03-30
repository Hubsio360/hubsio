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

// Helper functions to convert between snake_case (database) and camelCase (TypeScript)
const mapDbAssetToRiskAsset = (dbAsset: any): RiskAsset => ({
  id: dbAsset.id,
  companyId: dbAsset.company_id,
  name: dbAsset.name,
  description: dbAsset.description,
  category: dbAsset.category,
  owner: dbAsset.owner,
  value: dbAsset.value,
  createdAt: dbAsset.created_at,
  updatedAt: dbAsset.updated_at
});

const mapDbThreatToRiskThreat = (dbThreat: any): RiskThreat => ({
  id: dbThreat.id,
  companyId: dbThreat.company_id,
  name: dbThreat.name,
  description: dbThreat.description,
  source: dbThreat.source,
  category: dbThreat.category,
  createdAt: dbThreat.created_at,
  updatedAt: dbThreat.updated_at
});

const mapDbVulnerabilityToRiskVulnerability = (dbVuln: any): RiskVulnerability => ({
  id: dbVuln.id,
  companyId: dbVuln.company_id,
  name: dbVuln.name,
  description: dbVuln.description,
  category: dbVuln.category,
  createdAt: dbVuln.created_at,
  updatedAt: dbVuln.updated_at
});

const mapDbScenarioToRiskScenario = (dbScenario: any): RiskScenario => {
  return mapDbToRiskScenario(dbScenario);
};

const mapDbTreatmentToRiskTreatment = (dbTreatment: any): RiskTreatment => ({
  id: dbTreatment.id,
  riskScenarioId: dbTreatment.risk_scenario_id,
  strategy: dbTreatment.strategy,
  description: dbTreatment.description,
  responsible: dbTreatment.responsible,
  deadline: dbTreatment.deadline,
  status: dbTreatment.status,
  residualRiskLevel: dbTreatment.residual_risk_level,
  createdAt: dbTreatment.created_at,
  updatedAt: dbTreatment.updated_at
});

// Reverse mapping for sending data to the database
const mapRiskAssetToDbAsset = (asset: Omit<RiskAsset, 'id' | 'createdAt' | 'updatedAt'>) => ({
  company_id: asset.companyId,
  name: asset.name,
  description: asset.description,
  category: asset.category,
  owner: asset.owner,
  value: asset.value
});

const mapRiskThreatToDbThreat = (threat: Omit<RiskThreat, 'id' | 'createdAt' | 'updatedAt'>) => ({
  company_id: threat.companyId,
  name: threat.name,
  description: threat.description,
  source: threat.source,
  category: threat.category
});

const mapRiskVulnerabilityToDbVulnerability = (vulnerability: Omit<RiskVulnerability, 'id' | 'createdAt' | 'updatedAt'>) => ({
  company_id: vulnerability.companyId,
  name: vulnerability.name,
  description: vulnerability.description,
  category: vulnerability.category
});

const mapRiskScenarioToDbScenario = (scenario: Omit<RiskScenario, 'id' | 'createdAt' | 'updatedAt'>) => ({
  company_id: scenario.companyId,
  name: scenario.name,
  description: scenario.description,
  threat_id: scenario.threatId,
  vulnerability_id: scenario.vulnerabilityId,
  impact_description: scenario.impactDescription,
  impact_level: scenario.impactLevel,
  likelihood: scenario.likelihood,
  risk_level: scenario.riskLevel,
  status: scenario.status,
  scope: scenario.scope,
  residual_impact: scenario.residualImpact,
  residual_likelihood: scenario.residualLikelihood,
  residual_risk_level: scenario.residualRiskLevel,
  security_measures: scenario.securityMeasures,
  measure_effectiveness: scenario.measureEffectiveness,
  impact_scale_ratings: scenario.impactScaleRatings
});

const mapRiskTreatmentToDbTreatment = (treatment: Omit<RiskTreatment, 'id' | 'createdAt' | 'updatedAt'>) => ({
  risk_scenario_id: treatment.riskScenarioId,
  strategy: treatment.strategy,
  description: treatment.description,
  responsible: treatment.responsible,
  deadline: treatment.deadline,
  status: treatment.status,
  residual_risk_level: treatment.residualRiskLevel
});

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
      
      const fetchedAssets = (data || []).map(mapDbAssetToRiskAsset);
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
      
      const fetchedThreats = (data || []).map(mapDbThreatToRiskThreat);
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
      
      const fetchedVulnerabilities = (data || []).map(mapDbVulnerabilityToRiskVulnerability);
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
      
      const fetchedScenarios = (data || []).map(mapDbScenarioToRiskScenario);
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
      
      const fetchedTreatments = (data || []).map(mapDbTreatmentToRiskTreatment);
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
      const dbAsset = mapRiskAssetToDbAsset(asset);
      
      // Vérifier que tous les champs obligatoires sont présents
      if (!asset.companyId) {
        console.error('Erreur: Le champ companyId est obligatoire');
        throw new Error('Le champ companyId est obligatoire');
      }
      
      if (!asset.name) {
        console.error('Erreur: Le champ name est obligatoire');
        throw new Error('Le nom de l\'actif est obligatoire');
      }
      
      if (!asset.category) {
        console.error('Erreur: Le champ category est obligatoire');
        throw new Error('La catégorie de l\'actif est obligatoire');
      }
      
      if (!asset.value) {
        console.error('Erreur: Le champ value est obligatoire');
        throw new Error('La valeur de l\'actif est obligatoire');
      }
      
      console.log('Tentative d\'insertion d\'un actif dans la base de données:', dbAsset);
      
      const { data, error } = await supabase
        .from('risk_assets')
        .insert([dbAsset])
        .select()
        .single();
      
      if (error) {
        console.error('Erreur détaillée lors de l\'ajout d\'un actif:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Détails:', error.details);
        console.error('Message:', error.message);
        
        if (error.code === '42501') {
          throw new Error('Permissions insuffisantes. Vérifiez vos droits d\'accès.');
        } else if (error.code === '23505') {
          throw new Error('Un actif avec ce nom existe déjà.');
        } else {
          throw new Error(`Impossible d'ajouter l'actif: ${error.message}`);
        }
      }
      
      const newAsset = mapDbAssetToRiskAsset(data);
      setRiskAssets(prev => [...prev, newAsset]);
      toast({
        title: "Succès",
        description: "Actif ajouté avec succès",
      });
      return newAsset;
    } catch (error) {
      console.error('Erreur détaillée lors de l\'ajout d\'un actif:', error);
      
      // Afficher un message d'erreur plus précis
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Une erreur inconnue s'est produite lors de l'ajout de l'actif";
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, supabase, setRiskAssets]);

  // Add a risk threat
  const addRiskThreat = useCallback(async (threat: Omit<RiskThreat, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskThreat> => {
    try {
      const dbThreat = mapRiskThreatToDbThreat(threat);
      const { data, error } = await supabase
        .from('risk_threats')
        .insert([dbThreat])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk threat:', error);
        throw new Error(error.message);
      }
      
      const newThreat = mapDbThreatToRiskThreat(data);
      setRiskThreats(prev => [...prev, newThreat]);
      return newThreat;
    } catch (error) {
      console.error('Error adding risk threat:', error);
      throw error;
    }
  }, []);

  // Add a risk vulnerability
  const addRiskVulnerability = useCallback(async (vulnerability: Omit<RiskVulnerability, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskVulnerability> => {
    try {
      const dbVulnerability = mapRiskVulnerabilityToDbVulnerability(vulnerability);
      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .insert([dbVulnerability])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk vulnerability:', error);
        throw new Error(error.message);
      }
      
      const newVulnerability = mapDbVulnerabilityToRiskVulnerability(data);
      setRiskVulnerabilities(prev => [...prev, newVulnerability]);
      return newVulnerability;
    } catch (error) {
      console.error('Error adding risk vulnerability:', error);
      throw error;
    }
  }, []);

  // Add a risk scenario
  const addRiskScenario = useCallback(async (scenario: Omit<RiskScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskScenario> => {
    try {
      const dbScenario = mapRiskScenarioToDbScenario(scenario);
      const { data, error } = await supabase
        .from('risk_scenarios')
        .insert([dbScenario])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk scenario:', error);
        throw new Error(error.message);
      }
      
      const newScenario = mapDbScenarioToRiskScenario(data);
      setRiskScenarios(prev => [...prev, newScenario]);
      return newScenario;
    } catch (error) {
      console.error('Error adding risk scenario:', error);
      throw error;
    }
  }, []);

  // Function alias for consistency with other context functions
  const createRiskScenario = addRiskScenario;

  // Add a risk treatment
  const addRiskTreatment = useCallback(async (treatment: Omit<RiskTreatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskTreatment> => {
    try {
      const dbTreatment = mapRiskTreatmentToDbTreatment(treatment);
      const { data, error } = await supabase
        .from('risk_treatments')
        .insert([dbTreatment])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk treatment:', error);
        throw new Error(error.message);
      }
      
      const newTreatment = mapDbTreatmentToRiskTreatment(data);
      setRiskTreatments(prev => [...prev, newTreatment]);
      return newTreatment;
    } catch (error) {
      console.error('Error adding risk treatment:', error);
      throw error;
    }
  }, []);

  // Update a risk asset
  const updateRiskAsset = useCallback(async (id: string, asset: Partial<RiskAsset>): Promise<RiskAsset> => {
    try {
      // Convert camelCase to snake_case for database
      const updates: Record<string, any> = {};
      if (asset.name !== undefined) updates.name = asset.name;
      if (asset.description !== undefined) updates.description = asset.description;
      if (asset.category !== undefined) updates.category = asset.category;
      if (asset.owner !== undefined) updates.owner = asset.owner;
      if (asset.value !== undefined) updates.value = asset.value;
      
      const { data, error } = await supabase
        .from('risk_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk asset:', error);
        throw new Error(error.message);
      }
      
      const updatedAsset = mapDbAssetToRiskAsset(data);
      setRiskAssets(prev => prev.map(item => item.id === id ? updatedAsset : item));
      return updatedAsset;
    } catch (error) {
      console.error('Error updating risk asset:', error);
      throw error;
    }
  }, []);

  // Update a risk threat
  const updateRiskThreat = useCallback(async (id: string, threat: Partial<RiskThreat>): Promise<RiskThreat> => {
    try {
      // Convert camelCase to snake_case for database
      const updates: Record<string, any> = {};
      if (threat.name !== undefined) updates.name = threat.name;
      if (threat.description !== undefined) updates.description = threat.description;
      if (threat.source !== undefined) updates.source = threat.source;
      if (threat.category !== undefined) updates.category = threat.category;
      
      const { data, error } = await supabase
        .from('risk_threats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk threat:', error);
        throw new Error(error.message);
      }
      
      const updatedThreat = mapDbThreatToRiskThreat(data);
      setRiskThreats(prev => prev.map(item => item.id === id ? updatedThreat : item));
      return updatedThreat;
    } catch (error) {
      console.error('Error updating risk threat:', error);
      throw error;
    }
  }, []);

  // Update a risk vulnerability
  const updateRiskVulnerability = useCallback(async (id: string, vulnerability: Partial<RiskVulnerability>): Promise<RiskVulnerability> => {
    try {
      // Convert camelCase to snake_case for database
      const updates: Record<string, any> = {};
      if (vulnerability.name !== undefined) updates.name = vulnerability.name;
      if (vulnerability.description !== undefined) updates.description = vulnerability.description;
      if (vulnerability.category !== undefined) updates.category = vulnerability.category;
      
      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk vulnerability:', error);
        throw new Error(error.message);
      }
      
      const updatedVulnerability = mapDbVulnerabilityToRiskVulnerability(data);
      setRiskVulnerabilities(prev => prev.map(item => item.id === id ? updatedVulnerability : item));
      return updatedVulnerability;
    } catch (error) {
      console.error('Error updating risk vulnerability:', error);
      throw error;
    }
  }, []);

  // Update a risk scenario
  const updateRiskScenario = useCallback(async (id: string, scenario: Partial<RiskScenario>): Promise<RiskScenario> => {
    try {
      // Convert camelCase to snake_case for database
      const updates: Record<string, any> = {};
      if (scenario.name !== undefined) updates.name = scenario.name;
      if (scenario.description !== undefined) updates.description = scenario.description;
      if (scenario.threatId !== undefined) updates.threat_id = scenario.threatId;
      if (scenario.vulnerabilityId !== undefined) updates.vulnerability_id = scenario.vulnerabilityId;
      if (scenario.impactDescription !== undefined) updates.impact_description = scenario.impactDescription;
      if (scenario.impactLevel !== undefined) updates.impact_level = scenario.impactLevel;
      if (scenario.likelihood !== undefined) updates.likelihood = scenario.likelihood;
      if (scenario.riskLevel !== undefined) updates.risk_level = scenario.riskLevel;
      if (scenario.status !== undefined) updates.status = scenario.status;
      if (scenario.scope !== undefined) updates.scope = scenario.scope;
      
      // Map residual fields
      if (scenario.residualImpact !== undefined) updates.residual_impact = scenario.residualImpact;
      if (scenario.residualLikelihood !== undefined) updates.residual_likelihood = scenario.residualLikelihood;
      if (scenario.residualRiskLevel !== undefined) updates.residual_risk_level = scenario.residualRiskLevel;
      
      // Map security measure fields
      if (scenario.securityMeasures !== undefined) updates.security_measures = scenario.securityMeasures;
      if (scenario.measureEffectiveness !== undefined) updates.measure_effectiveness = scenario.measureEffectiveness;
      
      // Map impact scale ratings
      if (scenario.impactScaleRatings !== undefined) updates.impact_scale_ratings = scenario.impactScaleRatings;
      
      const { data, error } = await supabase
        .from('risk_scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk scenario:', error);
        throw new Error(error.message);
      }
      
      const updatedScenario = mapDbScenarioToRiskScenario(data);
      setRiskScenarios(prev => prev.map(item => item.id === id ? updatedScenario : item));
      return updatedScenario;
    } catch (error) {
      console.error('Error updating risk scenario:', error);
      throw error;
    }
  }, []);

  // Update a risk treatment
  const updateRiskTreatment = useCallback(async (id: string, treatment: Partial<RiskTreatment>): Promise<RiskTreatment> => {
    try {
      // Convert camelCase to snake_case for database
      const updates: Record<string, any> = {};
      if (treatment.riskScenarioId !== undefined) updates.risk_scenario_id = treatment.riskScenarioId;
      if (treatment.strategy !== undefined) updates.strategy = treatment.strategy;
      if (treatment.description !== undefined) updates.description = treatment.description;
      if (treatment.responsible !== undefined) updates.responsible = treatment.responsible;
      if (treatment.deadline !== undefined) updates.deadline = treatment.deadline;
      if (treatment.status !== undefined) updates.status = treatment.status;
      if (treatment.residualRiskLevel !== undefined) updates.residual_risk_level = treatment.residualRiskLevel;
      
      const { data, error } = await supabase
        .from('risk_treatments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk treatment:', error);
        throw new Error(error.message);
      }
      
      const updatedTreatment = mapDbTreatmentToRiskTreatment(data);
      setRiskTreatments(prev => prev.map(item => item.id === id ? updatedTreatment : item));
      return updatedTreatment;
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
      
      return (assets || []).map(mapDbAssetToRiskAsset);
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
    createRiskScenario,
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
