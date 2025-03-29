
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
    let mounted = true;
    
    if (rawImpact && rawLikelihood && mounted) {
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
      if (mounted) {
        setValue('rawRiskLevel', calculatedRiskLevel);
      }
    }
    
    return () => {
      mounted = false;
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
                        {scale.levels?.sort((a, b) => (a.level_value || 0) - (b.level_value || 0)).map(level => (
                          <SelectItem key={level.id} value={level.level_value === 1 ? 'low' : level.level_value === 2 ? 'medium' : level.level_value === 3 ? 'high' : 'critical'}>
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
      
      {likelihoodScale && (
        <FormField
          control={control}
          name="rawLikelihood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probabilité</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau de probabilité" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {likelihoodScale.levels?.sort((a, b) => (a.level_value || 0) - (b.level_value || 0)).map(level => (
                    <SelectItem key={level.id} value={level.level_value === 1 ? 'low' : level.level_value === 2 ? 'medium' : level.level_value === 3 ? 'high' : 'critical'}>
                      {level.name} - {level.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
