
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import ScenarioDetailHeader from '@/components/risk-analysis/scenario-detail/ScenarioDetailHeader';
import ScenarioDetailContent from '@/components/risk-analysis/scenario-detail/ScenarioDetailContent';
import LoadingState from '@/components/risk-analysis/scenario-detail/LoadingState';
import ScenarioNotFound from '@/components/risk-analysis/scenario-detail/ScenarioNotFound';
import { EditRiskScenarioModalV2 } from '@/components/risk-analysis/EditRiskScenarioModalV2';

const RiskScenarioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentScenario, setCurrentScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [generatingImpact, setGeneratingImpact] = useState(false);
  const data = useData();
  const { toast } = useToast();

  // Fetch scenario data with useCallback to avoid recreation at every render
  const fetchScenarioData = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      const { riskScenarios } = data;
      let scenario = riskScenarios.find(s => s.id === id);
      
      if (!scenario && currentScenario?.companyId) {
        await data.fetchRiskScenariosByCompanyId(currentScenario.companyId);
        scenario = data.riskScenarios.find(s => s.id === id);
      }
      
      if (scenario) {
        setCurrentScenario(scenario);
      } else {
        console.error("Could not find scenario with ID:", id);
        toast({
          title: "Erreur",
          description: "Impossible de trouver le scénario demandé",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching scenario:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails du scénario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, currentScenario?.companyId, data]);

  useEffect(() => {
    fetchScenarioData();
  }, [fetchScenarioData]);

  const handleSaveScenario = async (data) => {
    if (!currentScenario || !id) return false;
    
    try {
      const processedData = {
        ...data,
        threatId: data.threatId === "none" ? null : data.threatId,
        vulnerabilityId: data.vulnerabilityId === "none" ? null : data.vulnerabilityId
      };
      
      const updatedScenario = await updateRiskScenario(id, processedData);
      
      if (!updatedScenario) {
        throw new Error("Failed to update scenario");
      }
      
      // Update local state to reflect changes
      setCurrentScenario(prev => prev ? {...prev, ...processedData} : null);
      
      return true;
    } catch (error) {
      console.error("Error updating scenario:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le scénario",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteScenario = async () => {
    if (!currentScenario) return;
    
    try {
      await data.deleteRiskScenario(currentScenario.id);
      toast({
        title: "Succès",
        description: "Scénario de risque supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le scénario",
        variant: "destructive",
      });
    }
  };

  const generateImpactDescription = async () => {
    if (!currentScenario || !currentScenario.description) {
      toast({
        title: "Erreur",
        description: "La description du scénario est requise pour générer un impact",
        variant: "destructive",
      });
      return;
    }

    setGeneratingImpact(true);

    try {
      const { data: responseData, error } = await supabase.functions.invoke('generate-impact-description', {
        body: { scenarioDescription: currentScenario.description },
      });

      if (error) throw error;

      if (responseData.impactDescription) {
        const success = await data.updateRiskScenario(currentScenario.id, {
          impactDescription: responseData.impactDescription
        });

        if (success) {
          setCurrentScenario({
            ...currentScenario,
            impactDescription: responseData.impactDescription
          });

          toast({
            title: "Succès",
            description: "Description de l'impact générée avec succès",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la description de l'impact:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la description de l'impact",
        variant: "destructive",
      });
    } finally {
      setGeneratingImpact(false);
    }
  };

  const updateRiskScenario = async (id, scenarioData) => {
    try {
      // Convert camelCase fields to snake_case for database
      const updates = {};
      
      // Safely map properties, checking if they exist first
      if (scenarioData.name !== undefined) updates.name = scenarioData.name;
      if (scenarioData.description !== undefined) updates.description = scenarioData.description;
      if (scenarioData.threatId !== undefined) updates.threat_id = scenarioData.threatId;
      if (scenarioData.vulnerabilityId !== undefined) updates.vulnerability_id = scenarioData.vulnerabilityId;
      if (scenarioData.impactDescription !== undefined) updates.impact_description = scenarioData.impactDescription;
      if (scenarioData.impactLevel !== undefined) updates.impact_level = scenarioData.impactLevel;
      if (scenarioData.likelihood !== undefined) updates.likelihood = scenarioData.likelihood;
      if (scenarioData.riskLevel !== undefined) updates.risk_level = scenarioData.riskLevel;
      if (scenarioData.status !== undefined) updates.status = scenarioData.status;
      if (scenarioData.scope !== undefined) updates.scope = scenarioData.scope;
      if (scenarioData.rawImpact !== undefined) updates.raw_impact = scenarioData.rawImpact;
      if (scenarioData.rawLikelihood !== undefined) updates.raw_likelihood = scenarioData.rawLikelihood;
      if (scenarioData.rawRiskLevel !== undefined) updates.raw_risk_level = scenarioData.rawRiskLevel;
      if (scenarioData.residualImpact !== undefined) updates.residual_impact = scenarioData.residualImpact;
      if (scenarioData.residualLikelihood !== undefined) updates.residual_likelihood = scenarioData.residualLikelihood;
      if (scenarioData.residualRiskLevel !== undefined) updates.residual_risk_level = scenarioData.residualRiskLevel;
      if (scenarioData.securityMeasures !== undefined) updates.security_measures = scenarioData.securityMeasures;
      if (scenarioData.measureEffectiveness !== undefined) updates.measure_effectiveness = scenarioData.measureEffectiveness;
      if (scenarioData.impactScaleRatings !== undefined) updates.impact_scale_ratings = scenarioData.impactScaleRatings;
      
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
      
      // Map database fields to both camelCase and snake_case in our object for flexibility
      return {
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
        rawImpact: data.raw_impact,
        rawLikelihood: data.raw_likelihood,
        rawRiskLevel: data.raw_risk_level,
        residualImpact: data.residual_impact,
        residualLikelihood: data.residual_likelihood,
        residualRiskLevel: data.residual_risk_level,
        securityMeasures: data.security_measures,
        measureEffectiveness: data.measure_effectiveness,
        impactScaleRatings: data.impact_scale_ratings,
        
        // Include snake_case versions for backward compatibility
        company_id: data.company_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        impact_level: data.impact_level,
        risk_level: data.risk_level,
        threat_id: data.threat_id,
        vulnerability_id: data.vulnerability_id,
        impact_description: data.impact_description,
        raw_impact: data.raw_impact,
        raw_likelihood: data.raw_likelihood,
        raw_risk_level: data.raw_risk_level,
        residual_impact: data.residual_impact,
        residual_likelihood: data.residual_likelihood,
        residual_risk_level: data.residual_risk_level,
        security_measures: data.security_measures,
        measure_effectiveness: data.measure_effectiveness,
        impact_scale_ratings: data.impact_scale_ratings
      };
    } catch (error) {
      console.error('Error updating risk scenario:', error);
      return null;
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!currentScenario) {
    return <ScenarioNotFound />;
  }

  return (
    <div className="container mx-auto py-6">
      <ScenarioDetailHeader 
        scenario={currentScenario}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDeleteScenario}
      />
      
      <ScenarioDetailContent 
        scenario={currentScenario}
        isGenerating={generatingImpact}
        onGenerateImpact={generateImpactDescription}
      />
      
      {currentScenario && (
        <EditRiskScenarioModalV2
          open={isEditing}
          onOpenChange={(open) => {
            setIsEditing(open);
            
            // Refresh data when dialog closes to ensure we have latest state
            if (!open) {
              fetchScenarioData();
            }
          }}
          scenario={currentScenario}
          onSave={handleSaveScenario}
        />
      )}
    </div>
  );
};

export default RiskScenarioDetail;
