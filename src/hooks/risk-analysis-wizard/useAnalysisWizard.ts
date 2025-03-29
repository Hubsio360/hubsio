
import { useCompanyInfo } from './useCompanyInfo';
import { useRiskScenarios } from './useRiskScenarios';
import { useWizardState } from './useWizardState';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';

export function useAnalysisWizard(companyId: string, companyName = '', onComplete?: () => void) {
  // Initialize the specialized hooks
  const {
    loading: companyLoading,
    companyInfo,
    businessProcesses,
    updateCompanyName,
    updateCompanyDescription,
    updateCompanyActivities,
    fetchCompanyInfo,
    addBusinessProcess,
    removeBusinessProcess,
    setCompanyInfo
  } = useCompanyInfo();
  
  const {
    loading: scenariosLoading,
    suggestedScenarios,
    generatingScenarios,
    generationProgress,
    generateRiskScenarios,
    generateAdditionalScenarios,
    handleTemplateSelect,
    toggleScenarioSelection,
    saveScenarios,
    saveAndClose: baseSaveAndClose,
    storeBusinessProcesses
  } = useRiskScenarios(companyId);
  
  const {
    step,
    confirmDialogOpen,
    setConfirmDialogOpen,
    handleClose: baseHandleClose,
    resetAndClose: baseResetAndClose,
    goToNextStep: baseGoToNextStep,
    goToPreviousStep
  } = useWizardState();

  // Set initial company name if provided
  if (companyName && companyInfo.name === '') {
    setCompanyInfo(prev => ({ ...prev, name: companyName }));
  }

  // Combined loading state
  const loading = companyLoading || scenariosLoading;

  // Customized handleClose function
  const handleClose = (open: boolean) => {
    baseHandleClose(step, (newState) => {
      if (!newState) {
        resetAndClose();
      } else {
        setConfirmDialogOpen(newState);
      }
    });
  };

  // Customized resetAndClose function
  const resetAndClose = () => {
    baseResetAndClose((newState) => {
      // Execute onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    });
  };

  // Customized goToNextStep function
  const goToNextStep = async () => {
    if (step === 2) {
      // Avant de passer à l'étape 3, stocker les processus métier pour une utilisation ultérieure
      storeBusinessProcesses(businessProcesses);
      
      // Générer les scénarios
      const success = await generateRiskScenarios(companyInfo.name, businessProcesses);
      if (success) {
        baseGoToNextStep();
      }
      return;
    }
    
    if (step === 3) {
      // À la dernière étape, enregistrer les scénarios et fermer l'assistant
      const success = await saveScenarios();
      if (success) {
        if (onComplete) {
          onComplete();
        }
        resetAndClose();
      }
      return;
    }
    
    baseGoToNextStep();
  };

  // Fonction pour enregistrer et fermer
  const saveAndClose = async () => {
    const success = await baseSaveAndClose();
    if (success) {
      if (onComplete) {
        onComplete();
      }
      resetAndClose();
    }
    return success;
  };

  return {
    step,
    loading,
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
    saveAndClose,
    generateAdditionalScenarios
  };
}
