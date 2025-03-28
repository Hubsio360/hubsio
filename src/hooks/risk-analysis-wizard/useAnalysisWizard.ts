
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
    handleTemplateSelect,
    toggleScenarioSelection,
    saveScenarios
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
      // Before moving to step 3, generate scenarios
      const success = await generateRiskScenarios(companyInfo.name, businessProcesses);
      if (success) {
        baseGoToNextStep();
      }
      return;
    }
    
    if (step === 3) {
      // At the last step, save scenarios
      const success = await saveScenarios();
      if (success && onComplete) {
        onComplete();
        resetAndClose();
      }
      return;
    }
    
    baseGoToNextStep();
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
    saveScenarios
  };
}
