
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, PlusCircle, Loader2, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { RiskLevel, RiskScope, RiskStatus } from '@/types';
import RiskAssessmentSection from './RiskAssessmentSection';
import { useData } from '@/contexts/DataContext';

export interface RiskScenarioFormValues {
  name: string;
  description: string;
  riskLevel: string;
  impactLevel: string;
  likelihood: string;
  status: string;
  scope: string;
  impactDescription: string;
  rawImpact: RiskLevel;
  rawLikelihood: RiskLevel;
  rawRiskLevel: RiskLevel;
  residualImpact: RiskLevel;
  residualLikelihood: RiskLevel;
  residualRiskLevel: RiskLevel;
  securityMeasures: string;
  measureEffectiveness: string;
}

interface RiskScenarioFormProps {
  onSubmit: (values: RiskScenarioFormValues) => void;
  companyId: string;
  isEditMode?: boolean;
  initialValues?: Partial<RiskScenarioFormValues>;
  saveButtonText?: string;
  isSaving?: boolean;
  onCancel?: () => void;
}

export const RiskScenarioForm = forwardRef<{ handleTemplateSelect: (template: EnhancedTemplate) => void }, RiskScenarioFormProps>(
  ({ 
    onSubmit, 
    companyId, 
    isEditMode = false, 
    initialValues = {}, 
    saveButtonText = "Créer le scénario",
    isSaving = false,
    onCancel
  }, ref) => {
    const { companyRiskScales } = useData();
    
    // Form setup with react-hook-form
    const form = useForm<RiskScenarioFormValues>({
      defaultValues: {
        name: initialValues.name || '',
        description: initialValues.description || '',
        riskLevel: initialValues.riskLevel || 'medium',
        impactLevel: initialValues.impactLevel || 'medium',
        likelihood: initialValues.likelihood || 'medium',
        status: initialValues.status || 'identified',
        scope: initialValues.scope || 'technical',
        impactDescription: initialValues.impactDescription || '',
        rawImpact: initialValues.rawImpact || 'medium',
        rawLikelihood: initialValues.rawLikelihood || 'medium',
        rawRiskLevel: initialValues.rawRiskLevel || 'medium',
        residualImpact: initialValues.residualImpact || 'low',
        residualLikelihood: initialValues.residualLikelihood || 'low',
        residualRiskLevel: initialValues.residualRiskLevel || 'low',
        securityMeasures: initialValues.securityMeasures || '',
        measureEffectiveness: initialValues.measureEffectiveness || '',
        // Ensure default values for any selects that could have empty options
        threatId: initialValues.threatId || 'none',
        vulnerabilityId: initialValues.vulnerabilityId || 'none',
      },
    });

    // Calculate risk levels automatically
    useEffect(() => {
      const calculateRiskLevel = (impact: RiskLevel, likelihood: RiskLevel): RiskLevel => {
        const impactValues = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        const likelihoodValues = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        
        const score = impactValues[impact] * likelihoodValues[likelihood];
        
        if (score <= 2) return 'low';
        if (score <= 6) return 'medium';
        if (score <= 9) return 'high';
        return 'critical';
      };
      
      // Calculate raw risk level
      const rawImpact = form.watch('rawImpact') as RiskLevel;
      const rawLikelihood = form.watch('rawLikelihood') as RiskLevel;
      const rawRiskLevel = calculateRiskLevel(rawImpact, rawLikelihood);
      form.setValue('rawRiskLevel', rawRiskLevel);
      
      // Update form fields to match assessed levels
      form.setValue('impactLevel', rawImpact);
      form.setValue('likelihood', rawLikelihood);
      form.setValue('riskLevel', rawRiskLevel);
      
      // Calculate residual risk level
      const residualImpact = form.watch('residualImpact') as RiskLevel;
      const residualLikelihood = form.watch('residualLikelihood') as RiskLevel;
      const residualRiskLevel = calculateRiskLevel(residualImpact, residualLikelihood);
      form.setValue('residualRiskLevel', residualRiskLevel);
    }, [form, form.watch('rawImpact'), form.watch('rawLikelihood'), form.watch('residualImpact'), form.watch('residualLikelihood')]);

    // Expose template selection function to parent
    useImperativeHandle(ref, () => ({
      handleTemplateSelect: (template: EnhancedTemplate) => {
        form.setValue('name', template.name);
        form.setValue('description', template.description);
        form.setValue('scope', template.category as RiskScope || 'technical');
      },
    }));

    // Submit handler
    const handleFormSubmit = (values: RiskScenarioFormValues) => {
      onSubmit(values);
    };

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isEditMode ? "Modifier le scénario de risque" : "Définir un scénario de risque"}</CardTitle>
          <CardDescription>
            {isEditMode ? "Modifiez les caractéristiques du scénario et l'évaluation des impacts" : "Créez un nouveau scénario de risque en définissant ses caractéristiques"}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du scénario</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Fuite de données sensibles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez le scénario de risque en détail..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portée</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le périmètre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technical">Technique</SelectItem>
                            <SelectItem value="organizational">Organisationnel</SelectItem>
                            <SelectItem value="human">Humain</SelectItem>
                            <SelectItem value="physical">Physique</SelectItem>
                            <SelectItem value="environmental">Environnemental</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="identified">Identifié</SelectItem>
                            <SelectItem value="analyzed">Analysé</SelectItem>
                            <SelectItem value="treated">Traité</SelectItem>
                            <SelectItem value="accepted">Accepté</SelectItem>
                            <SelectItem value="monitored">Surveillé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="impactDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description de l'impact</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez les conséquences potentielles de ce risque..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Risk Assessment Section with Multiple Impact Scales */}
              <RiskAssessmentSection form={form} companyId={companyId} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : isEditMode ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {saveButtonText}
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {saveButtonText}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    );
  }
);

RiskScenarioForm.displayName = 'RiskScenarioForm';
