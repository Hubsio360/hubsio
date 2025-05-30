
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAnalysisWizard } from '@/hooks/risk-analysis-wizard/useAnalysisWizard';
import { CompanyInfoStep } from './wizard/CompanyInfoStep';
import { BusinessProcessStep } from './wizard/BusinessProcessStep';
import { RiskScenariosStep } from './wizard/RiskScenariosStep';
import { ConfirmDialog } from './wizard/ConfirmDialog';

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
              onAddProcess={addBusinessProcess}
              onRemoveProcess={removeBusinessProcess}
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
              onToggleScenario={toggleScenarioSelection}
              onComplete={goToNextStep}
              onPrevious={goToPreviousStep}
              onGenerateMoreScenarios={generateAdditionalScenarios}
              onSaveAndClose={saveAndClose}
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
