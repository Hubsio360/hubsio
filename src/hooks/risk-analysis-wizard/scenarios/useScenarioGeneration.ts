
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BusinessProcess, SuggestedScenario } from '../types';
import { ScenarioGenerationProgress } from './types';

export function useScenarioGeneration() {
  const { toast } = useToast();
  const [generationState, setGenerationState] = useState<ScenarioGenerationProgress>({
    generating: false,
    progress: 0
  });
  
  // Simuler la progression de génération
  const simulateProgress = () => {
    setGenerationState({
      generating: true,
      progress: 0
    });
    
    const interval = setInterval(() => {
      setGenerationState(prev => {
        if (prev.progress >= 95) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          progress: prev.progress + 5
        };
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  // Generate risk scenarios
  const generateRiskScenarios = async (
    companyName: string, 
    businessProcesses: BusinessProcess[],
    onSuccess: (scenarios: SuggestedScenario[]) => void
  ) => {
    if (businessProcesses.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez ajouter au moins un processus métier",
        variant: "destructive",
      });
      return false;
    }

    // Lancer l'animation de progression
    const stopProgress = simulateProgress();
    
    try {
      console.log('Appel de la fonction Edge pour générer des scénarios');
      
      const { data, error } = await supabase.functions.invoke('ai-risk-analysis', {
        body: {
          action: 'generateRiskScenarios',
          data: { 
            companyName,
            businessProcesses: businessProcesses.map(bp => bp.name)
          }
        }
      });

      if (error) {
        console.error('Erreur lors de l\'appel à la fonction Edge:', error);
        throw new Error(`Erreur lors de la génération des scénarios: ${error.message}`);
      }

      console.log('Scénarios reçus de la fonction Edge:', data);
      
      // Si data est un array, l'utiliser directement, sinon vérifier s'il y a une propriété pour les scénarios
      const scenarios = Array.isArray(data) ? data : (data.scenarios || []);
      
      if (scenarios.length === 0) {
        throw new Error('Aucun scénario n\'a été généré. Veuillez réessayer ou affiner les processus métier.');
      }

      // Compléter la progression à 100%
      setGenerationState({
        generating: true,
        progress: 100
      });
      
      // Attendre un court instant avant de passer à l'étape suivante
      setTimeout(() => {
        onSuccess(scenarios);
        setGenerationState({
          generating: false,
          progress: 0
        });
        
        // Suppression du toast de succès pour éviter l'empilement
        // toast({
        //   title: "Succès",
        //   description: `${scenarios.length} scénarios de risque générés avec succès`,
        // });
      }, 500);

      return true;
    } catch (error) {
      console.error("Erreur lors de la génération des scénarios:", error);
      stopProgress();
      setGenerationState({
        generating: false,
        progress: 0
      });
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer les scénarios de risque",
        variant: "destructive",
      });
      return false;
    }
  };

  // Generate additional risk scenarios
  const generateAdditionalScenarios = async (
    existingScenarios: SuggestedScenario[],
    onSuccess: (scenarios: SuggestedScenario[]) => void
  ) => {
    if (existingScenarios.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez d'abord générer des scénarios initiaux",
        variant: "destructive",
      });
      return;
    }

    setGenerationState(prev => ({ ...prev, generating: true }));
    try {
      // Récupérer les noms des scénarios déjà suggérés
      const existingScenarioNames = existingScenarios.map(s => s.name);

      const { data, error } = await supabase.functions.invoke('ai-risk-analysis', {
        body: {
          action: 'generateAdditionalScenarios',
          data: { 
            existingScenarios: existingScenarioNames
          }
        }
      });

      if (error) {
        throw new Error(`Erreur lors de la génération des scénarios additionnels: ${error.message}`);
      }

      const additionalScenarios = Array.isArray(data) ? data : (data.scenarios || []);
      
      if (additionalScenarios.length === 0) {
        throw new Error('Aucun scénario additionnel n\'a été généré.');
      }

      // Créer de nouveaux scénarios à partir des données reçues
      const newScenarios = additionalScenarios.map(scenario => ({
        id: `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: scenario.name,
        description: scenario.description,
        selected: false
      }));

      // Appeler le callback de succès avec les nouveaux scénarios
      onSuccess(newScenarios);

      // Suppression du toast de succès pour éviter l'empilement
      // toast({
      //   title: "Succès",
      //   description: `${additionalScenarios.length} scénarios additionnels générés`,
      // });
    } catch (error) {
      console.error("Erreur lors de la génération des scénarios additionnels:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer des scénarios additionnels",
        variant: "destructive",
      });
    } finally {
      setGenerationState(prev => ({ ...prev, generating: false }));
    }
  };

  return {
    generatingScenarios: generationState.generating,
    generationProgress: generationState.progress,
    generateRiskScenarios,
    generateAdditionalScenarios
  };
}
