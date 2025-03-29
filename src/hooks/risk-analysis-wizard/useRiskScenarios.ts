
import { useState } from 'react';
import { createErrorHandler } from '@/contexts/data/utils/auditErrorUtils';
import { useToast } from '@/hooks/use-toast';
import { BusinessProcess, SuggestedScenario } from './types';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';

import { useSessionCheck } from './scenarios/useSessionCheck';
import { useScenarioGeneration } from './scenarios/useScenarioGeneration';
import { useScenarioSaving } from './scenarios/useScenarioSaving';
import { useScenariosManagement } from './scenarios/useScenariosManagement';

export function useRiskScenarios(companyId: string) {
  const { toast } = useToast();
  const handleError = createErrorHandler(toast);
  const [loading, setLoading] = useState(false);

  // Utiliser les hooks séparés
  const { sessionError } = useSessionCheck();
  
  const { 
    suggestedScenarios, 
    setSuggestedScenarios, 
    handleTemplateSelect, 
    toggleScenarioSelection 
  } = useScenariosManagement();
  
  const { 
    generatingScenarios, 
    generationProgress, 
    generateRiskScenarios: baseGenerateRiskScenarios,
    generateAdditionalScenarios: baseGenerateAdditionalScenarios
  } = useScenarioGeneration();
  
  const {
    loading: savingLoading,
    storeBusinessProcesses,
    saveAndClose: baseSaveAndClose,
    saveScenarios: baseSaveScenarios,
    storedBusinessProcesses
  } = useScenarioSaving(companyId);

  // Wrapper pour générer des scénarios
  const generateRiskScenarios = async (companyName: string, businessProcesses: BusinessProcess[]) => {
    setLoading(true);
    const success = await baseGenerateRiskScenarios(
      companyName, 
      businessProcesses,
      (scenarios) => setSuggestedScenarios(scenarios)
    );
    setLoading(false);
    return success;
  };

  // Wrapper pour générer des scénarios additionnels
  const generateAdditionalScenarios = async () => {
    await baseGenerateAdditionalScenarios(
      suggestedScenarios,
      (newScenarios) => setSuggestedScenarios(prev => [...prev, ...newScenarios])
    );
  };

  // Wrapper pour sauvegarder et fermer
  const saveAndClose = async () => {
    const selectedScenarios = suggestedScenarios.filter(scenario => scenario.selected);
    setLoading(true);
    const result = await baseSaveAndClose(selectedScenarios);
    setLoading(false);
    return result;
  };

  // Wrapper pour sauvegarder les scénarios
  const saveScenarios = async () => {
    const selectedScenarios = suggestedScenarios.filter(scenario => scenario.selected);
    setLoading(true);
    const result = await baseSaveScenarios(selectedScenarios);
    setLoading(false);
    return result;
  };

  // Combiner l'état de chargement
  const isLoading = loading || savingLoading;

  return {
    loading: isLoading,
    suggestedScenarios,
    generatingScenarios,
    generationProgress,
    sessionError,
    generateRiskScenarios,
    generateAdditionalScenarios,
    handleTemplateSelect,
    toggleScenarioSelection,
    saveScenarios,
    saveAndClose,
    setSuggestedScenarios,
    storeBusinessProcesses
  };
}
