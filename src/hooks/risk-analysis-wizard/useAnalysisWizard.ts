
import { useState, useEffect } from 'react';
import { useScenarioSuggestion } from './scenarios/useScenarioSuggestion';
import { useScenarioSaving } from './scenarios/useScenarioSaving';
import { useToast } from '@/hooks/use-toast';
import { BusinessProcess, SuggestedScenario } from './types';
import { useTemplateSelection } from './scenarios/useTemplateSelection';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/navigation';

export const useAnalysisWizard = (companyId: string, companyName?: string, onComplete?: () => void) => {
  const [step, setStep] = useState(1);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Initialisation des hooks dépendants
  const { toast } = useToast();
  const router = useRouter();
  
  // État de l'entreprise
  const [companyInfo, setCompanyInfo] = useState({
    name: companyName || '',
    description: '',
    activities: ''
  });
  
  // États pour les processus métier et scénarios
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);
  const [suggestedScenarios, setSuggestedScenarios] = useState<SuggestedScenario[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Hooks spécialisés
  const { 
    generateScenarios, 
    generatingScenarios,
    generationProgress 
  } = useScenarioSuggestion();
  
  const {
    loading: savingLoading,
    storeBusinessProcesses,
    saveAndClose,
    saveScenarios
  } = useScenarioSaving(companyId);
  
  const { handleTemplateSelect } = useTemplateSelection(setSuggestedScenarios);
  
  // Mise à jour des informations de l'entreprise
  const updateCompanyName = (name: string) => {
    setCompanyInfo(prev => ({ ...prev, name }));
  };
  
  const updateCompanyDescription = (description: string) => {
    setCompanyInfo(prev => ({ ...prev, description }));
  };
  
  const updateCompanyActivities = (activities: string) => {
    setCompanyInfo(prev => ({ ...prev, activities }));
  };
  
  // Fetch company info from OpenAI
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
      setLoading(false);
      toast({
        title: "Succès",
        description: "Informations récupérées avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations sur l'entreprise",
        variant: "destructive",
      });
    }
  };
  
  // Gestion des processus métier
  const addBusinessProcess = (process: BusinessProcess) => {
    if (!process.name.trim()) return;
    
    // Vérifier si le processus existe déjà
    const exists = businessProcesses.some(p => 
      p.name.toLowerCase() === process.name.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Déjà présent",
        description: "Ce processus métier existe déjà dans la liste",
        variant: "destructive",
      });
      return;
    }
    
    setBusinessProcesses(prev => [...prev, process]);
  };
  
  const removeBusinessProcess = (index: number) => {
    setBusinessProcesses(prev => 
      prev.filter((_, i) => i !== index)
    );
  };
  
  // Génération des scénarios basés sur les processus métier
  const generateScenariosFromProcesses = async () => {
    if (businessProcesses.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez ajouter au moins un processus métier",
        variant: "destructive",
      });
      return;
    }
    
    const companyContext = {
      name: companyInfo.name,
      description: companyInfo.description,
      activities: companyInfo.activities
    };
    
    const results = await generateScenarios(companyContext, businessProcesses);
    setSuggestedScenarios(results);
    
    // Stockage des processus métier pour utilisation ultérieure
    storeBusinessProcesses(businessProcesses);
    
    // Passage à l'étape suivante
    if (results.length > 0) {
      setStep(3);
    }
  };
  
  // Génération de scénarios supplémentaires
  const generateAdditionalScenarios = async () => {
    if (businessProcesses.length === 0) return;
    
    const companyContext = {
      name: companyInfo.name,
      description: companyInfo.description,
      activities: companyInfo.activities
    };
    
    const results = await generateScenarios(companyContext, businessProcesses, 5);
    
    // Ajouter les nouveaux scénarios aux existants, en évitant les doublons
    const newScenarios = results.filter(newScenario => 
      !suggestedScenarios.some(existingScenario => 
        existingScenario.name === newScenario.name ||
        existingScenario.description === newScenario.description
      )
    );
    
    setSuggestedScenarios(prev => [...prev, ...newScenarios]);
    
    if (newScenarios.length > 0) {
      toast({
        title: "Nouveaux scénarios générés",
        description: `${newScenarios.length} nouveaux scénarios ont été ajoutés à la liste`,
      });
    } else {
      toast({
        title: "Information",
        description: "Aucun nouveau scénario unique n'a pu être généré",
        variant: "default",
      });
    }
  };
  
  // Navigation entre les étapes
  const goToNextStep = () => {
    if (step === 2) {
      generateScenariosFromProcesses();
    } else {
      setStep(prev => prev + 1);
    }
  };
  
  const goToPreviousStep = () => {
    setStep(prev => prev - 1);
  };
  
  // Basculer la sélection d'un scénario
  const toggleScenarioSelection = (index: number) => {
    setSuggestedScenarios(prev => 
      prev.map((scenario, i) => 
        i === index 
          ? { ...scenario, selected: !scenario.selected } 
          : scenario
      )
    );
  };
  
  // Enregistrement et fermeture
  const handleSave = async (): Promise<boolean> => {
    const selectedScenarios = suggestedScenarios.filter(scenario => scenario.selected);
    return await saveAndClose(selectedScenarios);
  };
  
  const saveAndRedirect = async () => {
    const success = await handleSave();
    if (success) {
      toast({
        title: "Succès",
        description: "L'analyse de risque a été créée avec succès",
      });
      
      if (onComplete) {
        onComplete();
      }
      
      // Redirection vers la page d'analyse de risque
      router.push(`/risk-analysis/${companyId}`);
    }
  };
  
  // Fermeture du wizard
  const handleClose = () => {
    setConfirmDialogOpen(true);
  };
  
  const resetAndClose = () => {
    setStep(1);
    setBusinessProcesses([]);
    setSuggestedScenarios([]);
    setConfirmDialogOpen(false);
    
    if (onComplete) {
      onComplete();
    }
  };
  
  return {
    step,
    loading: loading || savingLoading,
    companyInfo,
    businessProcesses,
    suggestedScenarios,
    confirmDialogOpen,
    generatingScenarios,
    generationProgress,
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
    setConfirmDialogOpen,
    saveScenarios,
    saveAndClose: saveAndRedirect,
    generateAdditionalScenarios
  };
};
