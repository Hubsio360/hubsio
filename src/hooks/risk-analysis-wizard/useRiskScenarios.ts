
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { BusinessProcess, SuggestedScenario, RiskScenarioCreate } from './types';
import { useData } from '@/contexts/DataContext';

export function useRiskScenarios(companyId: string) {
  const { toast } = useToast();
  const { createRiskScenario, addRiskAsset } = useData();
  const [loading, setLoading] = useState(false);
  const [suggestedScenarios, setSuggestedScenarios] = useState<SuggestedScenario[]>([]);
  const [generatingScenarios, setGeneratingScenarios] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);

  // Store business processes for later use
  const storeBusinessProcesses = (processes: BusinessProcess[]) => {
    setBusinessProcesses(processes);
  };

  // Simuler la progression de génération
  const simulateProgress = () => {
    setGeneratingScenarios(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  // Generate risk scenarios
  const generateRiskScenarios = async (
    companyName: string, 
    businessProcesses: BusinessProcess[]
  ) => {
    if (businessProcesses.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez ajouter au moins un processus métier",
        variant: "destructive",
      });
      return false;
    }

    // Store business processes for later use when saving
    storeBusinessProcesses(businessProcesses);

    setLoading(true);
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
      setGenerationProgress(100);
      
      // Attendre un court instant avant de passer à l'étape suivante
      setTimeout(() => {
        setSuggestedScenarios(scenarios);
        setGeneratingScenarios(false);
        setLoading(false);
        
        toast({
          title: "Succès",
          description: `${scenarios.length} scénarios de risque générés avec succès`,
        });
      }, 500);

      return true;
    } catch (error) {
      console.error("Erreur lors de la génération des scénarios:", error);
      stopProgress();
      setGeneratingScenarios(false);
      setLoading(false);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer les scénarios de risque",
        variant: "destructive",
      });
      return false;
    }
  };

  // Generate additional risk scenarios
  const generateAdditionalScenarios = async () => {
    if (suggestedScenarios.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez d'abord générer des scénarios initiaux",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Récupérer les noms des scénarios déjà suggérés
      const existingScenarioNames = suggestedScenarios.map(s => s.name);

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

      // Fusionner les nouveaux scénarios avec les existants
      setSuggestedScenarios(prev => [
        ...prev,
        ...additionalScenarios.map(scenario => ({
          id: `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: scenario.name,
          description: scenario.description,
          selected: false
        }))
      ]);

      toast({
        title: "Succès",
        description: `${additionalScenarios.length} scénarios additionnels générés`,
      });
    } catch (error) {
      console.error("Erreur lors de la génération des scénarios additionnels:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer des scénarios additionnels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: EnhancedTemplate) => {
    const newScenario: SuggestedScenario = {
      id: `scenario-${Date.now()}`,
      name: template.name,
      description: template.description,
      selected: true
    };
    
    setSuggestedScenarios([...suggestedScenarios, newScenario]);
    
    toast({
      title: "Scénario ajouté",
      description: `Le scénario "${template.name}" a été ajouté à la liste`,
    });
  };

  // Toggle scenario selection
  const toggleScenarioSelection = (id: string) => {
    setSuggestedScenarios(
      suggestedScenarios.map(scenario => 
        scenario.id === id 
          ? { ...scenario, selected: !scenario.selected } 
          : scenario
      )
    );
  };

  // Save scenarios and business processes as assets
  const saveAndClose = async () => {
    const selectedScenarios = suggestedScenarios.filter(scenario => scenario.selected);
    
    if (selectedScenarios.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // 1. Enregistrer chaque scénario sélectionné
      for (const scenario of selectedScenarios) {
        await createRiskScenario({
          companyId,
          name: scenario.name,
          description: scenario.description,
          status: 'identified',
          scope: 'technical',
          riskLevel: 'medium',
          impactLevel: 'medium',
          likelihood: 'medium',
          // Valeurs par défaut pour les autres champs
          rawImpact: 'medium',
          rawLikelihood: 'medium',
          rawRiskLevel: 'medium',
          residualImpact: 'low',
          residualLikelihood: 'low',
          residualRiskLevel: 'low'
        });
      }
      
      // 2. Enregistrer les processus métier comme actifs
      for (const process of businessProcesses) {
        await addRiskAsset({
          companyId,
          name: process.name,
          description: process.description || `Processus métier: ${process.name}`,
          category: 'processus',
          value: 'high',
          owner: ''
        });
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des données:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les données",
        variant: "destructive",
      });
      return false;
    }
  };

  // Save scenarios
  const saveScenarios = async () => {
    const selectedScenarios = suggestedScenarios.filter(scenario => scenario.selected);
    
    if (selectedScenarios.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Enregistrer chaque scénario sélectionné
      for (const scenario of selectedScenarios) {
        await createRiskScenario({
          companyId,
          name: scenario.name,
          description: scenario.description,
          status: 'identified',
          scope: 'technical',
          riskLevel: 'medium',
          impactLevel: 'medium',
          likelihood: 'medium',
          // Valeurs par défaut pour les autres champs
          rawImpact: 'medium',
          rawLikelihood: 'medium',
          rawRiskLevel: 'medium',
          residualImpact: 'low',
          residualLikelihood: 'low',
          residualRiskLevel: 'low'
        });
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des scénarios:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les scénarios de risque",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loading,
    suggestedScenarios,
    generatingScenarios,
    generationProgress,
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
