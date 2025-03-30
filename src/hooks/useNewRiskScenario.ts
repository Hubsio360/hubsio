
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { RiskLevel, RiskStatus, RiskScope } from '@/types';
import type { RiskScenarioFormValues } from '@/components/risk-analysis/new-scenario/RiskScenarioForm';

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
        companyId,
        name: values.name,
        description: values.description,
        riskLevel: values.riskLevel as RiskLevel,
        impactLevel: values.impactLevel as RiskLevel,
        likelihood: values.likelihood as RiskLevel,
        status: values.status as RiskStatus,
        scope: values.scope as RiskScope,
        impactDescription: values.impactDescription,
        rawImpact: values.rawImpact,
        rawLikelihood: values.rawLikelihood,
        rawRiskLevel: values.rawRiskLevel,
        residualImpact: values.residualImpact,
        residualLikelihood: values.residualLikelihood,
        residualRiskLevel: values.residualRiskLevel,
        securityMeasures: values.securityMeasures,
        // Supprimer cette propriété qui n'existe pas dans la base de données
        // measureEffectiveness: values.measureEffectiveness
      };

      await createRiskScenario(newScenario);
      
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
