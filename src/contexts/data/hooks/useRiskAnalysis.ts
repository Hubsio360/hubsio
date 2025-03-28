
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RiskAsset, RiskThreat, RiskVulnerability, RiskScenario, RiskTreatment } from '@/types';
import { toast } from '@/hooks/use-toast';

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

  // Assets
  const fetchRiskAssetsByCompanyId = async (companyId: string): Promise<RiskAsset[]> => {
    try {
      setLoading(prev => ({ ...prev, riskAssets: true }));
      const { data, error } = await supabase
        .from('risk_assets')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      const formattedAssets = data.map(asset => ({
        id: asset.id,
        companyId: asset.company_id,
        name: asset.name,
        description: asset.description,
        category: asset.category,
        owner: asset.owner,
        value: asset.value,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at
      }));

      setRiskAssets(formattedAssets);
      return formattedAssets;
    } catch (error) {
      console.error('Error fetching risk assets:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les actifs de risque',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskAssets: false }));
    }
  };

  const addRiskAsset = async (asset: Omit<RiskAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskAsset> => {
    try {
      const { data, error } = await supabase
        .from('risk_assets')
        .insert({
          company_id: asset.companyId,
          name: asset.name,
          description: asset.description,
          category: asset.category,
          owner: asset.owner,
          value: asset.value
        })
        .select()
        .single();

      if (error) throw error;

      const newAsset = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        category: data.category,
        owner: data.owner,
        value: data.value,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskAssets(prev => [...prev, newAsset]);
      return newAsset;
    } catch (error) {
      console.error('Error adding risk asset:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'actif de risque',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRiskAsset = async (id: string, assetUpdate: Partial<RiskAsset>): Promise<RiskAsset> => {
    try {
      const updates: any = {};
      if (assetUpdate.name) updates.name = assetUpdate.name;
      if (assetUpdate.description !== undefined) updates.description = assetUpdate.description;
      if (assetUpdate.category) updates.category = assetUpdate.category;
      if (assetUpdate.owner !== undefined) updates.owner = assetUpdate.owner;
      if (assetUpdate.value) updates.value = assetUpdate.value;

      const { data, error } = await supabase
        .from('risk_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedAsset = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        category: data.category,
        owner: data.owner,
        value: data.value,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskAssets(prev => prev.map(a => a.id === id ? updatedAsset : a));
      return updatedAsset;
    } catch (error) {
      console.error('Error updating risk asset:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'actif de risque',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteRiskAsset = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRiskAssets(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk asset:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'actif de risque',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Threats
  const fetchRiskThreatsByCompanyId = async (companyId: string): Promise<RiskThreat[]> => {
    try {
      setLoading(prev => ({ ...prev, riskThreats: true }));
      const { data, error } = await supabase
        .from('risk_threats')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      const formattedThreats = data.map(threat => ({
        id: threat.id,
        companyId: threat.company_id,
        name: threat.name,
        description: threat.description,
        source: threat.source,
        category: threat.category,
        createdAt: threat.created_at,
        updatedAt: threat.updated_at
      }));

      setRiskThreats(formattedThreats);
      return formattedThreats;
    } catch (error) {
      console.error('Error fetching risk threats:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les menaces',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskThreats: false }));
    }
  };

  const addRiskThreat = async (threat: Omit<RiskThreat, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskThreat> => {
    try {
      const { data, error } = await supabase
        .from('risk_threats')
        .insert({
          company_id: threat.companyId,
          name: threat.name,
          description: threat.description,
          source: threat.source,
          category: threat.category
        })
        .select()
        .single();

      if (error) throw error;

      const newThreat = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        source: data.source,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskThreats(prev => [...prev, newThreat]);
      return newThreat;
    } catch (error) {
      console.error('Error adding risk threat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la menace',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRiskThreat = async (id: string, threatUpdate: Partial<RiskThreat>): Promise<RiskThreat> => {
    try {
      const updates: any = {};
      if (threatUpdate.name) updates.name = threatUpdate.name;
      if (threatUpdate.description !== undefined) updates.description = threatUpdate.description;
      if (threatUpdate.source) updates.source = threatUpdate.source;
      if (threatUpdate.category) updates.category = threatUpdate.category;

      const { data, error } = await supabase
        .from('risk_threats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedThreat = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        source: data.source,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskThreats(prev => prev.map(t => t.id === id ? updatedThreat : t));
      return updatedThreat;
    } catch (error) {
      console.error('Error updating risk threat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la menace',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteRiskThreat = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_threats')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRiskThreats(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk threat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la menace',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Vulnerabilities
  const fetchRiskVulnerabilitiesByCompanyId = async (companyId: string): Promise<RiskVulnerability[]> => {
    try {
      setLoading(prev => ({ ...prev, riskVulnerabilities: true }));
      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      const formattedVulnerabilities = data.map(vulnerability => ({
        id: vulnerability.id,
        companyId: vulnerability.company_id,
        name: vulnerability.name,
        description: vulnerability.description,
        category: vulnerability.category,
        createdAt: vulnerability.created_at,
        updatedAt: vulnerability.updated_at
      }));

      setRiskVulnerabilities(formattedVulnerabilities);
      return formattedVulnerabilities;
    } catch (error) {
      console.error('Error fetching risk vulnerabilities:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les vulnérabilités',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskVulnerabilities: false }));
    }
  };

  const addRiskVulnerability = async (vulnerability: Omit<RiskVulnerability, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskVulnerability> => {
    try {
      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .insert({
          company_id: vulnerability.companyId,
          name: vulnerability.name,
          description: vulnerability.description,
          category: vulnerability.category
        })
        .select()
        .single();

      if (error) throw error;

      const newVulnerability = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskVulnerabilities(prev => [...prev, newVulnerability]);
      return newVulnerability;
    } catch (error) {
      console.error('Error adding risk vulnerability:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la vulnérabilité',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRiskVulnerability = async (id: string, vulnerabilityUpdate: Partial<RiskVulnerability>): Promise<RiskVulnerability> => {
    try {
      const updates: any = {};
      if (vulnerabilityUpdate.name) updates.name = vulnerabilityUpdate.name;
      if (vulnerabilityUpdate.description !== undefined) updates.description = vulnerabilityUpdate.description;
      if (vulnerabilityUpdate.category) updates.category = vulnerabilityUpdate.category;

      const { data, error } = await supabase
        .from('risk_vulnerabilities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedVulnerability = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskVulnerabilities(prev => prev.map(v => v.id === id ? updatedVulnerability : v));
      return updatedVulnerability;
    } catch (error) {
      console.error('Error updating risk vulnerability:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la vulnérabilité',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteRiskVulnerability = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_vulnerabilities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRiskVulnerabilities(prev => prev.filter(v => v.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk vulnerability:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la vulnérabilité',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Risk Scenarios
  const fetchRiskScenariosByCompanyId = async (companyId: string): Promise<RiskScenario[]> => {
    try {
      setLoading(prev => ({ ...prev, riskScenarios: true }));
      const { data, error } = await supabase
        .from('risk_scenarios')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      const formattedScenarios = data.map(scenario => ({
        id: scenario.id,
        companyId: scenario.company_id,
        name: scenario.name,
        description: scenario.description,
        threatId: scenario.threat_id,
        vulnerabilityId: scenario.vulnerability_id,
        impactDescription: scenario.impact_description,
        impactLevel: scenario.impact_level,
        likelihood: scenario.likelihood,
        riskLevel: scenario.risk_level,
        status: scenario.status,
        scope: scenario.scope,
        createdAt: scenario.created_at,
        updatedAt: scenario.updated_at
      }));

      setRiskScenarios(formattedScenarios);
      
      // Fetch assets for each scenario
      for (const scenario of formattedScenarios) {
        await getRiskScenarioAssets(scenario.id);
      }
      
      return formattedScenarios;
    } catch (error) {
      console.error('Error fetching risk scenarios:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les scénarios de risque',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskScenarios: false }));
    }
  };

  const addRiskScenario = async (scenario: Omit<RiskScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskScenario> => {
    try {
      const { data, error } = await supabase
        .from('risk_scenarios')
        .insert({
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
          scope: scenario.scope
        })
        .select()
        .single();

      if (error) throw error;

      const newScenario = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        threatId: data.threat_id,
        vulnerabilityId: data.vulnerability_id,
        impactDescription: data.impact_description,
        impactLevel: data.impact_level,
        likelihood: data.likelihood,
        riskLevel: data.risk_level,
        status: data.status,
        scope: data.scope,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Associate assets if provided
      if (scenario.assets && scenario.assets.length > 0) {
        for (const asset of scenario.assets) {
          await associateRiskScenarioWithAsset(newScenario.id, asset.id);
        }
      }

      setRiskScenarios(prev => [...prev, newScenario]);
      return newScenario;
    } catch (error) {
      console.error('Error adding risk scenario:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le scénario de risque',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRiskScenario = async (id: string, scenarioUpdate: Partial<RiskScenario>): Promise<RiskScenario> => {
    try {
      const updates: any = {};
      if (scenarioUpdate.name) updates.name = scenarioUpdate.name;
      if (scenarioUpdate.description !== undefined) updates.description = scenarioUpdate.description;
      if (scenarioUpdate.threatId !== undefined) updates.threat_id = scenarioUpdate.threatId;
      if (scenarioUpdate.vulnerabilityId !== undefined) updates.vulnerability_id = scenarioUpdate.vulnerabilityId;
      if (scenarioUpdate.impactDescription !== undefined) updates.impact_description = scenarioUpdate.impactDescription;
      if (scenarioUpdate.impactLevel) updates.impact_level = scenarioUpdate.impactLevel;
      if (scenarioUpdate.likelihood) updates.likelihood = scenarioUpdate.likelihood;
      if (scenarioUpdate.riskLevel) updates.risk_level = scenarioUpdate.riskLevel;
      if (scenarioUpdate.status) updates.status = scenarioUpdate.status;
      if (scenarioUpdate.scope) updates.scope = scenarioUpdate.scope;

      const { data, error } = await supabase
        .from('risk_scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedScenario = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        threatId: data.threat_id,
        vulnerabilityId: data.vulnerability_id,
        impactDescription: data.impact_description,
        impactLevel: data.impact_level,
        likelihood: data.likelihood,
        riskLevel: data.risk_level,
        status: data.status,
        scope: data.scope,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskScenarios(prev => prev.map(s => s.id === id ? updatedScenario : s));
      return updatedScenario;
    } catch (error) {
      console.error('Error updating risk scenario:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le scénario de risque',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteRiskScenario = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRiskScenarios(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk scenario:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le scénario de risque',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Risk Treatments
  const fetchRiskTreatmentsByScenarioId = async (scenarioId: string): Promise<RiskTreatment[]> => {
    try {
      setLoading(prev => ({ ...prev, riskTreatments: true }));
      const { data, error } = await supabase
        .from('risk_treatments')
        .select('*')
        .eq('risk_scenario_id', scenarioId);

      if (error) throw error;

      const formattedTreatments = data.map(treatment => ({
        id: treatment.id,
        riskScenarioId: treatment.risk_scenario_id,
        strategy: treatment.strategy,
        description: treatment.description,
        responsible: treatment.responsible,
        deadline: treatment.deadline,
        status: treatment.status,
        residualRiskLevel: treatment.residual_risk_level,
        createdAt: treatment.created_at,
        updatedAt: treatment.updated_at
      }));

      setRiskTreatments(prev => {
        const filtered = prev.filter(t => t.riskScenarioId !== scenarioId);
        return [...filtered, ...formattedTreatments];
      });
      
      return formattedTreatments;
    } catch (error) {
      console.error('Error fetching risk treatments:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les plans de traitement',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskTreatments: false }));
    }
  };

  const addRiskTreatment = async (treatment: Omit<RiskTreatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskTreatment> => {
    try {
      const { data, error } = await supabase
        .from('risk_treatments')
        .insert({
          risk_scenario_id: treatment.riskScenarioId,
          strategy: treatment.strategy,
          description: treatment.description,
          responsible: treatment.responsible,
          deadline: treatment.deadline,
          status: treatment.status,
          residual_risk_level: treatment.residualRiskLevel
        })
        .select()
        .single();

      if (error) throw error;

      const newTreatment = {
        id: data.id,
        riskScenarioId: data.risk_scenario_id,
        strategy: data.strategy,
        description: data.description,
        responsible: data.responsible,
        deadline: data.deadline,
        status: data.status,
        residualRiskLevel: data.residual_risk_level,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskTreatments(prev => [...prev, newTreatment]);
      return newTreatment;
    } catch (error) {
      console.error('Error adding risk treatment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le plan de traitement',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRiskTreatment = async (id: string, treatmentUpdate: Partial<RiskTreatment>): Promise<RiskTreatment> => {
    try {
      const updates: any = {};
      if (treatmentUpdate.strategy) updates.strategy = treatmentUpdate.strategy;
      if (treatmentUpdate.description) updates.description = treatmentUpdate.description;
      if (treatmentUpdate.responsible !== undefined) updates.responsible = treatmentUpdate.responsible;
      if (treatmentUpdate.deadline !== undefined) updates.deadline = treatmentUpdate.deadline;
      if (treatmentUpdate.status) updates.status = treatmentUpdate.status;
      if (treatmentUpdate.residualRiskLevel !== undefined) updates.residual_risk_level = treatmentUpdate.residualRiskLevel;

      const { data, error } = await supabase
        .from('risk_treatments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTreatment = {
        id: data.id,
        riskScenarioId: data.risk_scenario_id,
        strategy: data.strategy,
        description: data.description,
        responsible: data.responsible,
        deadline: data.deadline,
        status: data.status,
        residualRiskLevel: data.residual_risk_level,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRiskTreatments(prev => prev.map(t => t.id === id ? updatedTreatment : t));
      return updatedTreatment;
    } catch (error) {
      console.error('Error updating risk treatment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le plan de traitement',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteRiskTreatment = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_treatments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRiskTreatments(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting risk treatment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le plan de traitement',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Risk scenario - asset associations
  const associateRiskScenarioWithAsset = async (scenarioId: string, assetId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_scenario_assets')
        .insert({
          risk_scenario_id: scenarioId,
          asset_id: assetId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error associating risk scenario with asset:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'associer le scénario de risque avec l\'actif',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeRiskScenarioAssetAssociation = async (scenarioId: string, assetId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('risk_scenario_assets')
        .delete()
        .eq('risk_scenario_id', scenarioId)
        .eq('asset_id', assetId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing risk scenario asset association:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'association entre le scénario de risque et l\'actif',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getRiskScenarioAssets = async (scenarioId: string): Promise<RiskAsset[]> => {
    try {
      const { data, error } = await supabase
        .from('risk_scenario_assets')
        .select('asset_id')
        .eq('risk_scenario_id', scenarioId);

      if (error) throw error;

      if (data.length === 0) return [];

      const assetIds = data.map(item => item.asset_id);
      
      const { data: assetsData, error: assetsError } = await supabase
        .from('risk_assets')
        .select('*')
        .in('id', assetIds);

      if (assetsError) throw assetsError;

      const assets = assetsData.map(asset => ({
        id: asset.id,
        companyId: asset.company_id,
        name: asset.name,
        description: asset.description,
        category: asset.category,
        owner: asset.owner,
        value: asset.value,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at
      }));

      // Update the scenario in the state with its assets
      setRiskScenarios(prev => {
        return prev.map(scenario => {
          if (scenario.id === scenarioId) {
            return { ...scenario, assets };
          }
          return scenario;
        });
      });

      return assets;
    } catch (error) {
      console.error('Error getting risk scenario assets:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les actifs associés au scénario de risque',
        variant: 'destructive',
      });
      return [];
    }
  };

  return {
    riskAssets,
    riskThreats,
    riskVulnerabilities,
    riskScenarios,
    riskTreatments,
    loading: {
      riskAssets: loading.riskAssets,
      riskThreats: loading.riskThreats,
      riskVulnerabilities: loading.riskVulnerabilities,
      riskScenarios: loading.riskScenarios,
      riskTreatments: loading.riskTreatments
    },
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
    getRiskScenarioAssets
  };
};
