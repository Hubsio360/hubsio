
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { useData } from '@/contexts/DataContext';

interface BusinessProcess {
  id: string;
  name: string;
  description?: string;
}

interface SuggestedScenario {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface CompanyInfo {
  name: string;
  description: string;
  activities: string;
}

export function useAnalysisWizard(companyId: string, companyName = '', onComplete?: () => void) {
  const { toast } = useToast();
  const { createRiskScenario } = useData();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: companyName,
    description: '',
    activities: ''
  });
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);
  const [suggestedScenarios, setSuggestedScenarios] = useState<SuggestedScenario[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Update company name
  const updateCompanyName = (name: string) => {
    setCompanyInfo(prev => ({ ...prev, name }));
  };

  // Update company description
  const updateCompanyDescription = (description: string) => {
    setCompanyInfo(prev => ({ ...prev, description }));
  };

  // Update company activities
  const updateCompanyActivities = (activities: string) => {
    setCompanyInfo(prev => ({ ...prev, activities }));
  };

  // Fetch company info
  const fetchCompanyInfo = async () => {
    if (!companyInfo.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom de l'entreprise",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Appel de la fonction Edge pour obtenir les infos de l\'entreprise');
      
      const { data, error } = await supabase.functions.invoke('ai-risk-analysis', {
        body: {
          action: 'getCompanyInfo',
          data: { companyName: companyInfo.name.trim() }
        }
      });

      if (error) {
        console.error('Erreur lors de l\'appel à la fonction Edge:', error);
        throw new Error(`Erreur lors de la récupération des données: ${error.message}`);
      }

      console.log('Données reçues de la fonction Edge:', data);
      
      // Mise à jour des informations de l'entreprise
      setCompanyInfo(prev => ({
        ...prev, 
        description: data.description || '',
        activities: data.activities || ''
      }));

      // Extraire et créer automatiquement les processus métier à partir des activités
      const processLines = (data.activities || '').split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(1).trim());
      
      if (processLines.length > 0) {
        const newProcesses = processLines.map((process, index) => ({
          id: `process-${Date.now()}-${index}`,
          name: process
        }));
        
        setBusinessProcesses(newProcesses);
        console.log(`${newProcesses.length} processus métier extraits et ajoutés automatiquement:`, newProcesses);
      } else {
        console.log('Aucun processus métier n\'a pu être extrait des données reçues');
      }

      setLoading(false);
      toast({
        title: "Succès",
        description: "Informations sur l'entreprise récupérées avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de récupérer les informations de l'entreprise",
        variant: "destructive",
      });
    }
  };

  // Add a business process
  const addBusinessProcess = (processName: string) => {
    if (!processName.trim()) return;
    
    const newProcessItem: BusinessProcess = {
      id: `process-${Date.now()}`,
      name: processName.trim()
    };
    
    setBusinessProcesses([...businessProcesses, newProcessItem]);
  };

  // Remove a business process
  const removeBusinessProcess = (id: string) => {
    setBusinessProcesses(businessProcesses.filter(process => process.id !== id));
  };

  // Generate risk scenarios
  const generateRiskScenarios = async () => {
    if (businessProcesses.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez ajouter au moins un processus métier",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Appel de la fonction Edge pour générer des scénarios');
      
      const { data, error } = await supabase.functions.invoke('ai-risk-analysis', {
        body: {
          action: 'generateRiskScenarios',
          data: { 
            companyName: companyInfo.name,
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

      setSuggestedScenarios(scenarios);
      setLoading(false);
      toast({
        title: "Succès",
        description: `${scenarios.length} scénarios de risque générés avec succès`,
      });
    } catch (error) {
      console.error("Erreur lors de la génération des scénarios:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer les scénarios de risque",
        variant: "destructive",
      });
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

  // Save scenarios
  const saveScenarios = async () => {
    const selectedScenarios = suggestedScenarios.filter(scenario => scenario.selected);
    
    if (selectedScenarios.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return;
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

      toast({
        title: "Succès",
        description: `${selectedScenarios.length} scénarios de risque ont été créés avec succès`,
      });
      
      if (onComplete) {
        onComplete();
      }
      
      resetAndClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des scénarios:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les scénarios de risque",
        variant: "destructive",
      });
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (step > 1 && !confirmDialogOpen) {
      setConfirmDialogOpen(true);
    } else {
      resetAndClose();
    }
  };

  // Reset and close wizard
  const resetAndClose = () => {
    setStep(1);
    setConfirmDialogOpen(false);
  };

  // Go to next step
  const goToNextStep = async () => {
    if (step === 2) {
      // Before moving to step 3, generate scenarios
      await generateRiskScenarios();
    }
    
    if (step === 3) {
      // At the last step, save scenarios
      await saveScenarios();
      return;
    }
    
    setStep(step + 1);
  };

  // Go to previous step
  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  return {
    step,
    loading,
    companyInfo,
    businessProcesses,
    suggestedScenarios,
    confirmDialogOpen,
    updateCompanyName,
    updateCompanyDescription,
    updateCompanyActivities,
    fetchCompanyInfo,
    addBusinessProcess,
    removeBusinessProcess,
    handleTemplateSelect,
    toggleScenarioSelection,
    handleClose,
    resetAndClose,
    goToNextStep,
    goToPreviousStep,
    setConfirmDialogOpen
  };
}
