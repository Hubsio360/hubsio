
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { RiskScenario, RiskLevel, RiskScope, RiskStatus } from '@/types';
import { Loader2 } from 'lucide-react';
import { ScenarioBasicInfo } from './scenario-editor/ScenarioBasicInfo';
import { RiskAssessmentSection } from './scenario-editor/RiskAssessmentSection';
import { ResidualRiskSection } from './scenario-editor/ResidualRiskSection';
import { ThreatVulnerabilitySection } from './scenario-editor/ThreatVulnerabilitySection';

interface EditRiskScenarioModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: RiskScenario | null;
  onSave: (scenario: Partial<RiskScenario>) => Promise<boolean>;
}

interface ScenarioFormValues {
  name: string;
  description: string;
  impactDescription: string;
  scope: RiskScope;
  status: RiskStatus;
  rawImpact: RiskLevel;
  rawLikelihood: RiskLevel;
  rawRiskLevel: RiskLevel;
  residualImpact: RiskLevel;
  residualLikelihood: RiskLevel;
  residualRiskLevel: RiskLevel;
  securityMeasures: string;
  measureEffectiveness: string;
  threatId: string;
  vulnerabilityId: string;
  impactScaleRatings: Record<string, RiskLevel>;
}

export function EditRiskScenarioModalV2({
  open,
  onOpenChange,
  scenario,
  onSave
}: EditRiskScenarioModalV2Props) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();
  const { companyRiskScales } = useData();
  
  const methods = useForm<ScenarioFormValues>({
    defaultValues: scenario ? {
      name: scenario.name,
      description: scenario.description || '',
      impactDescription: scenario.impactDescription || '',
      scope: scenario.scope,
      status: scenario.status,
      rawImpact: scenario.rawImpact || scenario.impactLevel,
      rawLikelihood: scenario.rawLikelihood || scenario.likelihood,
      rawRiskLevel: scenario.rawRiskLevel || scenario.riskLevel,
      residualImpact: scenario.residualImpact || 'low',
      residualLikelihood: scenario.residualLikelihood || 'low',
      residualRiskLevel: scenario.residualRiskLevel || 'low',
      securityMeasures: scenario.securityMeasures || '',
      measureEffectiveness: scenario.measureEffectiveness || '',
      threatId: scenario.threatId || 'none',
      vulnerabilityId: scenario.vulnerabilityId || 'none',
      impactScaleRatings: scenario.impactScaleRatings || {},
    } : {} as ScenarioFormValues
  });

  // Reset form when dialog opens or scenario changes
  useEffect(() => {
    if (open && scenario) {
      methods.reset({
        name: scenario.name,
        description: scenario.description || '',
        impactDescription: scenario.impactDescription || '',
        scope: scenario.scope,
        status: scenario.status,
        rawImpact: scenario.rawImpact || scenario.impactLevel,
        rawLikelihood: scenario.rawLikelihood || scenario.likelihood,
        rawRiskLevel: scenario.rawRiskLevel || scenario.riskLevel,
        residualImpact: scenario.residualImpact || 'low',
        residualLikelihood: scenario.residualLikelihood || 'low',
        residualRiskLevel: scenario.residualRiskLevel || 'low',
        securityMeasures: scenario.securityMeasures || '',
        measureEffectiveness: scenario.measureEffectiveness || '',
        threatId: scenario.threatId || 'none',
        vulnerabilityId: scenario.vulnerabilityId || 'none',
        impactScaleRatings: scenario.impactScaleRatings || {},
      });
      setFormError(null);
    }
  }, [open, scenario, methods]);

  // Clean up state when dialog closes
  useEffect(() => {
    if (!open) {
      setSaving(false);
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async (values: ScenarioFormValues) => {
    if (!scenario) return;
    
    try {
      setSaving(true);
      setFormError(null);
      
      const updatedScenario: Partial<RiskScenario> = {
        name: values.name,
        description: values.description,
        impactDescription: values.impactDescription,
        impactLevel: values.rawImpact, // Main impact level is set to raw impact
        likelihood: values.rawLikelihood, // Main likelihood is set to raw likelihood
        riskLevel: values.rawRiskLevel, // Main risk level is set to raw risk level
        scope: values.scope,
        status: values.status,
        rawImpact: values.rawImpact,
        rawLikelihood: values.rawLikelihood,
        rawRiskLevel: values.rawRiskLevel,
        residualImpact: values.residualImpact,
        residualLikelihood: values.residualLikelihood,
        residualRiskLevel: values.residualRiskLevel,
        securityMeasures: values.securityMeasures,
        measureEffectiveness: values.measureEffectiveness,
        impactScaleRatings: values.impactScaleRatings,
        threatId: values.threatId === "none" ? null : values.threatId,
        vulnerabilityId: values.vulnerabilityId === "none" ? null : values.vulnerabilityId
      };
      
      const success = await onSave(updatedScenario);
      
      if (success) {
        // Ensure dialog closes properly before showing toast
        onOpenChange(false);
        
        // Small delay to ensure UI updates properly
        setTimeout(() => {
          toast({
            title: "Scénario mis à jour",
            description: "Les modifications ont été enregistrées avec succès"
          });
        }, 100);
      } else {
        setFormError("Impossible de sauvegarder les modifications.");
        setSaving(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du scénario:', error);
      setFormError("Une erreur s'est produite lors de la sauvegarde.");
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le scénario de risque",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Prevent closing while saving
    if (saving) return;
    
    // Reset form and close dialog
    methods.reset();
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Prevent closing while saving
        if (saving && !newOpen) return;
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le scénario de risque</DialogTitle>
          <DialogDescription>
            Modifiez les détails du scénario et l'évaluation des impacts
          </DialogDescription>
        </DialogHeader>
        
        {scenario && (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
              <ScenarioBasicInfo />
              
              <RiskAssessmentSection 
                companyId={scenario.companyId} 
              />
              
              <ResidualRiskSection />
              
              <ThreatVulnerabilitySection 
                companyId={scenario.companyId} 
              />
              
              {formError && (
                <div className="text-sm font-medium text-destructive">{formError}</div>
              )}
              
              <DialogFooter className="pt-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
