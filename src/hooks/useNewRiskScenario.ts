import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { RiskLevel, RiskStatus, RiskScope, mapRiskScenarioToDb } from '@/types';
import { RiskScenarioScope } from '@/types/risk-scenario';
import type { RiskScenarioFormValues } from '@/components/risk-analysis/new-scenario/RiskScenarioForm';
import { supabase } from '@/integrations/supabase/client';

export const useNewRiskScenario = (companyId: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    companies,
    createRiskScenario
  } = useData();

  // Company data
  const company = companyId ? companies?.find(company => company.id === companyId) : null;

  // Load data
  useEffect(() => {
    // Set loading to false after a short delay to ensure companies data has been loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [companies]);

  // Form submission handler
  const handleSubmit = async (values: RiskScenarioFormValues) => {
    if (!companyId) return;

    try {
      const newScenario = {
        company_id: companyId,
        name: values.name,
        description: values.description,
        risk_level: values.riskLevel as RiskLevel,
        impact_level: values.impactLevel as RiskLevel,
        likelihood: values.likelihood as RiskLevel,
        status: values.status as RiskStatus,
        scope: values.scope as RiskScenarioScope,
        impact_description: values.impactDescription,
        residual_impact: values.residualImpact,
        residual_likelihood: values.residualLikelihood,
        residual_risk_level: values.residualRiskLevel,
        security_measures: values.securityMeasures,
        measure_effectiveness: values.measureEffectiveness,
        raw_impact: values.rawImpact,
        raw_likelihood: values.rawLikelihood,
        raw_risk_level: values.rawRiskLevel
      };

      // Ajout direct en utilisant la structure snake_case attendue par Supabase
      const { data, error } = await supabase
        .from('risk_scenarios')
        .insert([newScenario])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Scénario créé",
        description: "Le scénario de risque a été créé avec succès",
      });
      
      navigate(`/risk-analysis/${companyId}`);
    } catch (error) {
      console.error('Erreur lors de la création du scénario:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du scénario",
      });
    }
  };

  return {
    company,
    isLoading,
    handleSubmit
  };
};
