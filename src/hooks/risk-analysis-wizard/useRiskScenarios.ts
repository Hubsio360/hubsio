
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { BusinessProcess, SuggestedScenario, RiskScenarioCreate } from './types';
import { useData } from '@/contexts/DataContext';
import { createErrorHandler } from '@/contexts/data/utils/auditErrorUtils';

export function useRiskScenarios(companyId: string) {
  const { toast } = useToast();
  const handleError = createErrorHandler(toast);
  const { createRiskScenario, addRiskAsset } = useData();
  const [loading, setLoading] = useState(false);
  const [suggestedScenarios, setSuggestedScenarios] = useState<SuggestedScenario[]>([]);
  const [generatingScenarios, setGeneratingScenarios] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Vérifier la session au montage du composant
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setSessionError("Session d'authentification invalide. Veuillez vous reconnecter.");
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter pour continuer",
          variant: "destructive",
        });
      }
    };
    
    checkSession();
  }, [toast]);

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

    // Vérification de session avant toute opération
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("Erreur d'authentification:", sessionError || "Aucune session active");
      toast({
        title: "Erreur d'authentification",
        description: "Veuillez vous reconnecter pour enregistrer les données",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    let hasErrors = false;
    let savedAssetsCount = 0;
    let savedScenariosCount = 0;

    try {
      console.log('Début de sauvegarde des scénarios et des processus métier');
      console.log('ID entreprise:', companyId);
      console.log('Nombre de scénarios à sauvegarder:', selectedScenarios.length);
      console.log('Nombre de processus métier à sauvegarder:', businessProcesses.length);

      // Vérification de l'ID de l'entreprise
      if (!companyId) {
        console.error("L'ID de l'entreprise est manquant ou invalide:", companyId);
        throw new Error("ID d'entreprise invalide");
      }

      console.log('Session Supabase valide:', !!sessionData.session);
      console.log('User ID:', sessionData.session?.user?.id);

      // 1. Enregistrer les processus métier comme actifs
      console.log('Sauvegarde des processus métier:', businessProcesses.length);
      for (const process of businessProcesses) {
        try {
          console.log('Tentative d\'enregistrement du processus:', process.name);
          // Ajout d'informations supplémentaires pour le debugging
          const processData = {
            companyId,
            name: process.name,
            description: process.description || `Processus métier: ${process.name}`,
            category: 'processus',
            value: 'high',
            owner: ''
          };
          console.log('Données du processus à enregistrer:', processData);
          
          await addRiskAsset(processData);
          savedAssetsCount++;
          console.log(`Processus enregistré avec succès: ${process.name}`);
        } catch (processError) {
          console.error(`Erreur lors de l'enregistrement du processus ${process.name}:`, processError);
          console.error('Détails de l\'erreur:', JSON.stringify(processError));
          hasErrors = true;
          // Continuer avec les autres processus malgré l'erreur
        }
      }
      
      // 2. Enregistrer chaque scénario sélectionné
      console.log('Sauvegarde des scénarios de risque');
      for (const scenario of selectedScenarios) {
        try {
          console.log('Tentative d\'enregistrement du scénario:', scenario.name);
          // Ajout d'informations supplémentaires pour le debugging
          const scenarioData = {
            companyId,
            name: scenario.name,
            description: scenario.description,
            status: 'identified',
            scope: 'technical',
            riskLevel: 'medium',
            impactLevel: 'medium',
            likelihood: 'medium',
            rawImpact: 'medium',
            rawLikelihood: 'medium',
            rawRiskLevel: 'medium',
            residualImpact: 'low',
            residualLikelihood: 'low',
            residualRiskLevel: 'low'
          };
          console.log('Données du scénario à enregistrer:', scenarioData);
          
          await createRiskScenario(scenarioData);
          savedScenariosCount++;
          console.log(`Scénario enregistré avec succès: ${scenario.name}`);
        } catch (scenarioError) {
          console.error(`Erreur lors de l'enregistrement du scénario ${scenario.name}:`, scenarioError);
          console.error('Détails de l\'erreur:', JSON.stringify(scenarioError));
          hasErrors = true;
          // Continuer avec les autres scénarios malgré l'erreur
        }
      }
      
      if (hasErrors) {
        if (savedAssetsCount > 0 || savedScenariosCount > 0) {
          toast({
            title: "Succès partiel",
            description: `${savedScenariosCount} scénario(s) et ${savedAssetsCount} processus métier enregistrés. Certaines entrées n'ont pas pu être sauvegardées.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible d'enregistrer les données. Vérifiez les droits d'accès et réessayez.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Succès",
          description: `${savedScenariosCount} scénario(s) et ${savedAssetsCount} processus métier enregistrés`,
        });
      }
      
      setLoading(false);
      return savedScenariosCount > 0 || savedAssetsCount > 0;
    } catch (error) {
      console.error("Erreur détaillée lors de l'enregistrement des données:", error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      setLoading(false);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer les données. Veuillez vérifier vos droits d'accès.",
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
        try {
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
        } catch (scenarioError) {
          console.error(`Erreur lors de l'enregistrement du scénario ${scenario.name}:`, scenarioError);
        }
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
