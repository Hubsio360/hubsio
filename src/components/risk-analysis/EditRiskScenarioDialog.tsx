
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { RiskScenario } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { RiskScenarioForm } from '@/components/risk-analysis/new-scenario/RiskScenarioForm';

interface EditRiskScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: RiskScenario | null;
  onSave: (scenario: Partial<RiskScenario>) => Promise<boolean>;
}

export function EditRiskScenarioDialog({
  open,
  onOpenChange,
  scenario,
  onSave
}: EditRiskScenarioDialogProps) {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { companyRiskScales } = useData();
  
  // Form reference to access the form's methods
  const formRef = React.useRef<any>(null);

  const handleSubmit = async (values: any) => {
    if (!scenario) return;
    
    setSaving(true);
    
    try {
      // Process any "none" values to null or empty string depending on backend requirements
      const updatedScenario: Partial<RiskScenario> = {
        name: values.name,
        description: values.description,
        impactDescription: values.impactDescription,
        impactLevel: values.impactLevel,
        likelihood: values.likelihood,
        riskLevel: values.riskLevel,
        scope: values.scope,
        status: values.status,
        // Add assessment data
        rawImpact: values.rawImpact,
        rawLikelihood: values.rawLikelihood,
        rawRiskLevel: values.rawRiskLevel,
        residualImpact: values.residualImpact,
        residualLikelihood: values.residualLikelihood,
        residualRiskLevel: values.residualRiskLevel,
        securityMeasures: values.securityMeasures,
        measureEffectiveness: values.measureEffectiveness,
        // Handle any "none" values for IDs
        threatId: values.threatId === "none" ? null : values.threatId,
        vulnerabilityId: values.vulnerabilityId === "none" ? null : values.vulnerabilityId
      };
      
      const success = await onSave(updatedScenario);
      
      if (success) {
        onOpenChange(false);
        toast({
          title: "Scénario mis à jour",
          description: "Les modifications ont été enregistrées avec succès"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du scénario:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le scénario de risque",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le scénario de risque</DialogTitle>
          <DialogDescription>
            Modifiez les détails du scénario et l'évaluation des impacts
          </DialogDescription>
        </DialogHeader>
        
        {scenario && (
          <RiskScenarioForm
            ref={formRef}
            onSubmit={handleSubmit}
            companyId={scenario.companyId}
            isEditMode={true}
            initialValues={{
              name: scenario.name,
              description: scenario.description || '',
              riskLevel: scenario.riskLevel,
              impactLevel: scenario.impactLevel,
              likelihood: scenario.likelihood,
              status: scenario.status,
              scope: scenario.scope,
              impactDescription: scenario.impactDescription || '',
              rawImpact: scenario.rawImpact || scenario.impactLevel,
              rawLikelihood: scenario.rawLikelihood || scenario.likelihood,
              rawRiskLevel: scenario.rawRiskLevel || scenario.riskLevel,
              residualImpact: scenario.residualImpact || 'low',
              residualLikelihood: scenario.residualLikelihood || 'low',
              residualRiskLevel: scenario.residualRiskLevel || 'low',
              securityMeasures: scenario.securityMeasures || '',
              measureEffectiveness: scenario.measureEffectiveness || '',
              threatId: scenario.threatId || 'none',
              vulnerabilityId: scenario.vulnerabilityId || 'none'
            }}
            saveButtonText="Enregistrer les modifications"
            isSaving={saving}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
