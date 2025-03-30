
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { RiskScenario } from '@/types';
import { EditRiskScenarioModalV2 } from '@/components/risk-analysis/EditRiskScenarioModalV2';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import ScenarioDetailHeader from '@/components/risk-analysis/scenario-detail/ScenarioDetailHeader';
import ScenarioDetailContent from '@/components/risk-analysis/scenario-detail/ScenarioDetailContent';
import LoadingState from '@/components/risk-analysis/scenario-detail/LoadingState';
import ScenarioNotFound from '@/components/risk-analysis/scenario-detail/ScenarioNotFound';

const RiskScenarioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentScenario, setCurrentScenario] = useState<RiskScenario | null>(null);
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
        
        if (currentScenario?.companyId) {
          // We'll handle navigation in the header component
        }
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

  const handleSaveScenario = async (data: Partial<RiskScenario>): Promise<boolean> => {
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
      // We'll let the header component handle navigation
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

  const updateRiskScenario = async (id: string, scenarioData: Partial<RiskScenario>): Promise<RiskScenario | null> => {
    try {
      // Convert camelCase fields to snake_case for database
      const updates: Record<string, any> = {};
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
      
      const { data: updatedData, error } = await supabase
        .from('risk_scenarios')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating risk scenario:', error);
        throw new Error(error.message);
      }
      
      // Map database fields to application format
      const updatedScenario: RiskScenario = {
        id: updatedData.id,
        companyId: updatedData.company_id,
        name: updatedData.name,
        description: updatedData.description,
        threatId: updatedData.threat_id,
        vulnerabilityId: updatedData.vulnerability_id,
        impactDescription: updatedData.impact_description,
        impactLevel: updatedData.impact_level,
        likelihood: updatedData.likelihood,
        riskLevel: updatedData.risk_level,
        status: updatedData.status,
        scope: updatedData.scope,
        rawImpact: updatedData.raw_impact,
        rawLikelihood: updatedData.raw_likelihood,
        rawRiskLevel: updatedData.raw_risk_level,
        residualImpact: updatedData.residual_impact,
        residualLikelihood: updatedData.residual_likelihood,
        residualRiskLevel: updatedData.residual_risk_level,
        securityMeasures: updatedData.security_measures,
        measureEffectiveness: updatedData.measure_effectiveness,
        impactScaleRatings: updatedData.impact_scale_ratings,
        createdAt: updatedData.created_at,
        updatedAt: updatedData.updated_at,
        // Add snake_case fields for compatibility
        company_id: updatedData.company_id,
        created_at: updatedData.created_at,
        updated_at: updatedData.updated_at,
        impact_level: updatedData.impact_level,
        risk_level: updatedData.risk_level,
        threat_id: updatedData.threat_id,
        vulnerability_id: updatedData.vulnerability_id,
        impact_description: updatedData.impact_description,
        raw_impact: updatedData.raw_impact,
        raw_likelihood: updatedData.raw_likelihood,
        raw_risk_level: updatedData.raw_risk_level,
        residual_impact: updatedData.residual_impact,
        residual_likelihood: updatedData.residual_likelihood,
        residual_risk_level: updatedData.residual_risk_level,
        security_measures: updatedData.security_measures,
        measure_effectiveness: updatedData.measure_effectiveness,
        impact_scale_ratings: updatedData.impact_scale_ratings,
      };
      
      return updatedScenario;
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
