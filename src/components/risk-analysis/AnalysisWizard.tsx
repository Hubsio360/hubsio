
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAnalysisWizard } from '@/hooks/risk-analysis-wizard/useAnalysisWizard';
import { CompanyInfoStep } from './wizard/CompanyInfoStep';
import { BusinessProcessStep } from './wizard/BusinessProcessStep';
import { RiskScenariosStep } from './wizard/RiskScenariosStep';
import { ConfirmDialog } from './wizard/ConfirmDialog';
import { BusinessProcess, SuggestedScenario } from '@/hooks/risk-analysis-wizard/types';

interface AnalysisWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName?: string;
  onComplete?: () => void;
}

export function AnalysisWizard({ 
  open, 
  onOpenChange, 
  companyId, 
  companyName = '', 
  onComplete 
}: AnalysisWizardProps) {
  const {
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
  } = useAnalysisWizard(companyId, companyName, onComplete);

  const handleModalClose = () => {
    if (step > 1) {
      setConfirmDialogOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  // Adapter pour corriger l'incompatibilité de type
  const handleAddProcess = (process: string) => {
    const businessProcess: BusinessProcess = {
      id: `process-${Date.now()}`,
      name: process,
      description: ``
    };
    addBusinessProcess(businessProcess);
  };

  // Adapter pour corriger l'incompatibilité de type
  const handleRemoveProcess = (id: string) => {
    // Trouver l'index à partir de l'id
    const index = businessProcesses.findIndex(process => process.id === id);
    if (index !== -1) {
      removeBusinessProcess(index);
    }
  };

  // Adapter pour corriger l'incompatibilité de type
  const handleToggleScenario = (id: string) => {
    toggleScenarioSelection(id);
  };

  // Adapter pour corriger l'incompatibilité de type
  const handleSaveAndClose = async (): Promise<boolean> => {
    await saveAndClose();
    return true;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent 
          className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden"
          onInteractOutside={(e) => {
            if (step > 1) {
              e.preventDefault();
              setConfirmDialogOpen(true);
            }
          }}
          onEscapeKeyDown={() => {
            if (step > 1) {
              setConfirmDialogOpen(true);
            } else {
              handleModalClose();
            }
          }}
        >
          {step === 1 && (
            <CompanyInfoStep
              companyInfo={companyInfo}
              loading={loading}
              onCompanyNameChange={updateCompanyName}
              onDescriptionChange={updateCompanyDescription}
              onActivitiesChange={updateCompanyActivities}
              onFetchInfo={fetchCompanyInfo}
              onNext={goToNextStep}
              onCancel={() => onOpenChange(false)}
            />
          )}
          
          {step === 2 && (
            <BusinessProcessStep
              businessProcesses={businessProcesses}
              onAddProcess={handleAddProcess}
              onRemoveProcess={handleRemoveProcess}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              generatingScenarios={generatingScenarios}
              generationProgress={generationProgress}
            />
          )}
          
          {step === 3 && (
            <RiskScenariosStep
              suggestedScenarios={suggestedScenarios}
              loading={loading}
              onSelectTemplate={handleTemplateSelect}
              onToggleScenario={handleToggleScenario}
              onComplete={goToNextStep}
              onPrevious={goToPreviousStep}
              onGenerateMoreScenarios={generateAdditionalScenarios}
              onSaveAndClose={handleSaveAndClose}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={resetAndClose}
      />
    </>
  );
}
