
import { useState } from 'react';
import { BusinessProcess, SuggestedScenario } from '../types';
import { useScenarioGeneration } from './useScenarioGeneration';
import { CompanyInfo } from '../types';

export function useScenarioSuggestion() {
  const {
    generatingScenarios,
    generationProgress,
    generateRiskScenarios,
  } = useScenarioGeneration();
  
  // Fonction pour générer des scénarios de risque
  const generateScenarios = async (
    companyContext: CompanyInfo,
    businessProcesses: BusinessProcess[],
    count?: number
  ): Promise<SuggestedScenario[]> => {
    try {
      // Créer un tableau pour stocker les résultats
      let generatedScenarios: SuggestedScenario[] = [];
      
      // Appeler la fonction de génération de scénarios
      const success = await generateRiskScenarios(
        companyContext.name,
        businessProcesses,
        (scenarios) => {
          generatedScenarios = scenarios;
        }
      );
      
      if (!success) {
        throw new Error("La génération des scénarios a échoué");
      }
      
      // Retourner les scénarios générés (limités par count si spécifié)
      if (count && generatedScenarios.length > count) {
        return generatedScenarios.slice(0, count);
      }
      
      return generatedScenarios;
    } catch (error) {
      console.error("Erreur lors de la génération des scénarios:", error);
      return [];
    }
  };
  
  return {
    generateScenarios,
    generatingScenarios,
    generationProgress
  };
}
