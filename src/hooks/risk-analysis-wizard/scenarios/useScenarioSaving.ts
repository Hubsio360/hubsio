
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SuggestedScenario, BusinessProcess } from '../types';
import { useData } from '@/contexts/DataContext';
import { RiskScope, RiskStatus, RiskLevel } from '@/types';

export function useScenarioSaving(companyId: string) {
  const { toast } = useToast();
  const { createRiskScenario, addRiskAsset } = useData();
  const [loading, setLoading] = useState(false);
  const [storedBusinessProcesses, setStoredBusinessProcesses] = useState<BusinessProcess[]>([]);

  // Store business processes for later use
  const storeBusinessProcesses = (processes: BusinessProcess[]) => {
    setStoredBusinessProcesses(processes);
  };

  // Save scenarios and business processes as assets
  const saveAndClose = async (selectedScenarios: SuggestedScenario[]) => {
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
      console.log('Nombre de processus métier à sauvegarder:', storedBusinessProcesses.length);

      // Vérification de l'ID de l'entreprise
      if (!companyId) {
        console.error("L'ID de l'entreprise est manquant ou invalide:", companyId);
        throw new Error("ID d'entreprise invalide");
      }

      console.log('Session Supabase valide:', !!sessionData.session);
      console.log('User ID:', sessionData.session?.user?.id);

      // 1. Enregistrer les processus métier comme actifs
      console.log('Sauvegarde des processus métier:', storedBusinessProcesses.length);
      for (const process of storedBusinessProcesses) {
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
            status: 'identified' as RiskStatus, // Cast to RiskStatus type
            scope: 'technical' as RiskScope, // Cast to RiskScope type
            riskLevel: 'medium' as RiskLevel, // Cast to RiskLevel type
            impactLevel: 'medium' as RiskLevel, // Cast to RiskLevel type
            likelihood: 'medium' as RiskLevel, // Cast to RiskLevel type
            rawImpact: 'medium' as RiskLevel, // Cast to RiskLevel type
            rawLikelihood: 'medium' as RiskLevel, // Cast to RiskLevel type
            rawRiskLevel: 'medium' as RiskLevel, // Cast to RiskLevel type
            residualImpact: 'low' as RiskLevel, // Cast to RiskLevel type
            residualLikelihood: 'low' as RiskLevel, // Cast to RiskLevel type
            residualRiskLevel: 'low' as RiskLevel // Cast to RiskLevel type
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
          // Toast de succès partiel seulement en cas d'erreur
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
        // Suppression du toast de succès complet pour éviter l'empilement
        // toast({
        //   title: "Succès",
        //   description: `${savedScenariosCount} scénario(s) et ${savedAssetsCount} processus métier enregistrés`,
        // });
        console.log("Sauvegarde réussie:", `${savedScenariosCount} scénario(s) et ${savedAssetsCount} processus métier enregistrés`);
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

  // Save only scenarios without business processes
  const saveScenarios = async (selectedScenarios: SuggestedScenario[]) => {
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
            status: 'identified' as RiskStatus, // Cast to RiskStatus type
            scope: 'technical' as RiskScope, // Cast to RiskScope type
            riskLevel: 'medium' as RiskLevel, // Cast to RiskLevel type
            impactLevel: 'medium' as RiskLevel, // Cast to RiskLevel type
            likelihood: 'medium' as RiskLevel, // Cast to RiskLevel type
            // Valeurs par défaut pour les autres champs
            rawImpact: 'medium' as RiskLevel, // Cast to RiskLevel type
            rawLikelihood: 'medium' as RiskLevel, // Cast to RiskLevel type
            rawRiskLevel: 'medium' as RiskLevel, // Cast to RiskLevel type
            residualImpact: 'low' as RiskLevel, // Cast to RiskLevel type
            residualLikelihood: 'low' as RiskLevel, // Cast to RiskLevel type
            residualRiskLevel: 'low' as RiskLevel // Cast to RiskLevel type
          });
        } catch (scenarioError) {
          console.error(`Erreur lors de l'enregistrement du scénario ${scenario.name}:`, scenarioError);
          toast({
            title: "Erreur",
            description: `Erreur lors de l'enregistrement du scénario: ${scenario.name}`,
            variant: "destructive",
          });
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
    storeBusinessProcesses,
    saveAndClose,
    saveScenarios,
    storedBusinessProcesses
  };
}
