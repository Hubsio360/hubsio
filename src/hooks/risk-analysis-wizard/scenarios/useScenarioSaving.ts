
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SuggestedScenario, BusinessProcess } from '../types';
import { useData } from '@/contexts/DataContext';
import { RiskLevel, RiskStatus, mapRiskScenarioToDb } from '@/types';
import { RiskScenarioScope } from '@/types/risk-scenario';

export function useScenarioSaving(companyId: string) {
  const { toast } = useToast();
  const { createRiskScenario, addRiskAsset } = useData();
  const [loading, setLoading] = useState(false);
  const [storedBusinessProcesses, setStoredBusinessProcesses] = useState<BusinessProcess[]>([]);

  const storeBusinessProcesses = (processes: BusinessProcess[]) => {
    setStoredBusinessProcesses(processes);
  };

  const saveAndClose = async (selectedScenarios: SuggestedScenario[]) => {
    if (selectedScenarios.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return false;
    }

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

      if (!companyId) {
        console.error("L'ID de l'entreprise est manquant ou invalide:", companyId);
        throw new Error("ID d'entreprise invalide");
      }

      console.log('Session Supabase valide:', !!sessionData.session);
      console.log('User ID:', sessionData.session?.user?.id);

      console.log('Sauvegarde des processus métier:', storedBusinessProcesses.length);
      for (const process of storedBusinessProcesses) {
        try {
          console.log('Tentative d\'enregistrement du processus:', process.name);
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
        }
      }

      console.log('Sauvegarde des scénarios de risque');
      for (const scenario of selectedScenarios) {
        try {
          console.log('Tentative d\'enregistrement du scénario:', scenario.name);
          const scenarioData = {
            company_id: companyId,
            name: scenario.name,
            description: scenario.description,
            status: 'identified' as RiskStatus,
            scope: 'organization' as RiskScenarioScope,
            impact_level: 'medium' as RiskLevel,
            likelihood: 'medium' as RiskLevel,
            risk_level: 'medium' as RiskLevel,
            residual_impact: 'low' as RiskLevel,
            residual_likelihood: 'low' as RiskLevel,
            residual_risk_level: 'low' as RiskLevel
          };
          console.log('Données du scénario à enregistrer:', scenarioData);
          
          const { data, error } = await supabase
            .from('risk_scenarios')
            .insert([scenarioData])
            .select()
            .single();
            
          if (error) throw error;
          
          savedScenariosCount++;
          console.log(`Scénario enregistré avec succès: ${scenario.name}`);
        } catch (scenarioError) {
          console.error(`Erreur lors de l'enregistrement du scénario ${scenario.name}:`, scenarioError);
          console.error('Détails de l\'erreur:', JSON.stringify(scenarioError));
          hasErrors = true;
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

  const saveScenarios = async (scenariosToSave: SuggestedScenario[]) => {
    if (scenariosToSave.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    let hasErrors = false;
    let savedScenariosCount = 0;

    try {
      console.log('Début de sauvegarde des scénarios');
      
      for (const scenario of scenariosToSave) {
        try {
          const scenarioData = {
            company_id: companyId,
            name: scenario.name,
            description: scenario.description,
            status: 'identified' as RiskStatus,
            scope: 'organization' as RiskScenarioScope,
            impact_level: 'medium' as RiskLevel,
            likelihood: 'medium' as RiskLevel,
            risk_level: 'medium' as RiskLevel,
            residual_impact: 'low' as RiskLevel,
            residual_likelihood: 'low' as RiskLevel,
            residual_risk_level: 'low' as RiskLevel
          };
          
          const { data, error } = await supabase
            .from('risk_scenarios')
            .insert([scenarioData])
            .select()
            .single();
          
          if (error) {
            console.error('Erreur lors de l\'enregistrement du scénario:', error);
            hasErrors = true;
          } else {
            savedScenariosCount++;
          }
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement du scénario:', error);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer les scénarios de risque",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: `${savedScenariosCount} scénario(s) enregistrés`,
        });
      }

      setLoading(false);
      return !hasErrors;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des scénarios:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les scénarios de risque",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
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
