
import { useState } from 'react';

export function useWizardState() {
  const [step, setStep] = useState(1);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Handle dialog close
  const handleClose = (currentStep: number, setDialogOpen: (open: boolean) => void) => {
    if (currentStep > 1 && !confirmDialogOpen) {
      setDialogOpen(true);
      setConfirmDialogOpen(true);
    } else {
      resetAndClose(setDialogOpen);
    }
  };

  // Reset and close wizard
  const resetAndClose = (setDialogOpen: (open: boolean) => void) => {
    setStep(1);
    setConfirmDialogOpen(false);
    setDialogOpen(false);
  };

  // Go to next step
  const goToNextStep = () => {
    setStep(step + 1);
  };

  // Go to previous step
  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  return {
    step,
    confirmDialogOpen,
    setConfirmDialogOpen,
    handleClose,
    resetAndClose,
    goToNextStep,
    goToPreviousStep
  };
}
