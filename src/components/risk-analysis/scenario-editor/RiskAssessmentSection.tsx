
import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import { RiskLevel } from '@/types';
import { RiskScenarioFormValues } from '@/components/risk-analysis/new-scenario/RiskScenarioForm';

interface RiskAssessmentSectionProps {
  companyId: string;
}

export function RiskAssessmentSection({ companyId }: RiskAssessmentSectionProps) {
  // Explicitly type the form context
  const form = useFormContext<RiskScenarioFormValues>();
  const { control, setValue } = form;
  
  const { 
    impactScales, 
    likelihoodScale, 
    activeImpactScale, 
    setActiveImpactScale, 
    impactScaleRatings, 
    handleImpactScaleChange 
  } = useRiskAssessment(form, companyId);
  
  // Watch raw impact and likelihood to calculate risk level
  const rawImpact = useWatch({ control, name: 'rawImpact' }) as RiskLevel;
  const rawLikelihood = useWatch({ control, name: 'rawLikelihood' }) as RiskLevel;
  
  // Calculate risk level when impact or likelihood changes
  useEffect(() => {
    let isMounted = true;
    
    if (rawImpact && rawLikelihood) {
      const riskMatrix: Record<RiskLevel, Record<RiskLevel, RiskLevel>> = {
        low: {
          low: 'low',
          medium: 'low',
          high: 'medium',
          critical: 'high'
        },
        medium: {
          low: 'low',
          medium: 'medium',
          high: 'high',
          critical: 'critical'
        },
        high: {
          low: 'medium',
          medium: 'high',
          high: 'high',
          critical: 'critical'
        },
        critical: {
          low: 'high',
          medium: 'critical',
          high: 'critical',
          critical: 'critical'
        }
      };
      
      const calculatedRiskLevel = riskMatrix[rawImpact][rawLikelihood];
      if (isMounted) {
        setValue('rawRiskLevel', calculatedRiskLevel);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [rawImpact, rawLikelihood, setValue]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Évaluation du risque brut</h3>
      
      {impactScales.length > 0 && (
        <Tabs 
          defaultValue={activeImpactScale || impactScales[0]?.id} 
          onValueChange={setActiveImpactScale}
          className="w-full"
        >
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm font-medium">Échelles d'impact:</span>
            <TabsList className="h-9">
              {impactScales.map(scale => (
                <TabsTrigger 
                  key={scale.id} 
                  value={scale.id}
                  className="text-xs px-2 py-1 h-8"
                >
                  {scale.scaleType?.name || 'Impact'}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {impactScales.map(scale => (
            <TabsContent key={scale.id} value={scale.id} className="space-y-4">
              <FormField
                control={control}
                name={`impactScaleRatings.${scale.id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {scale.scaleType?.name || 'Impact'} - {scale.scaleType?.description || ''}
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleImpactScaleChange(scale.id, value as RiskLevel);
                      }} 
                      defaultValue={field.value || 'low'}
                      value={field.value || 'low'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Niveau d'impact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scale.levels?.sort((a, b) => (a.levelValue || 0) - (b.levelValue || 0)).map(level => (
                          <SelectItem key={level.id} value={level.levelValue === 1 ? 'low' : level.levelValue === 2 ? 'medium' : level.levelValue === 3 ? 'high' : 'critical'}>
                            {level.name} - {level.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <FormField
          control={control}
          name="rawLikelihood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probabilité brute</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une probabilité" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="rawRiskLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niveau de risque brut</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
                disabled
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau de risque calculé" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Niveau calculé automatiquement à partir de l'impact maximal multiplié par la probabilité
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
