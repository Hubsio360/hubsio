
import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { RiskLevel } from '@/types';
import { RiskScenarioFormValues } from '@/components/risk-analysis/new-scenario/RiskScenarioForm';

export function ResidualRiskSection() {
  const form = useFormContext<RiskScenarioFormValues>();
  const { control, setValue } = form;
  
  // Watch residual impact and likelihood to calculate residual risk level
  const residualImpact = useWatch({ control, name: 'residualImpact' }) as RiskLevel;
  const residualLikelihood = useWatch({ control, name: 'residualLikelihood' }) as RiskLevel;
  
  // Calculate risk level when impact or likelihood changes
  React.useEffect(() => {
    if (residualImpact && residualLikelihood) {
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
      
      const calculatedRiskLevel = riskMatrix[residualImpact][residualLikelihood];
      setValue('residualRiskLevel', calculatedRiskLevel);
    }
  }, [residualImpact, residualLikelihood, setValue]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Évaluation du risque résiduel</h3>
      
      <FormField
        control={control}
        name="securityMeasures"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mesures de sécurité</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Décrivez les mesures de sécurité mises en place..." 
                className="min-h-[100px]" 
                {...field} 
                value={typeof field.value === 'string' ? field.value : ''}
              />
            </FormControl>
            <FormDescription>
              Détaillez les mesures de sécurité mises en œuvre pour réduire ce risque
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Removed measureEffectiveness field as it doesn't exist in the database */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <FormField
          control={control}
          name="residualImpact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact résiduel</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau d'impact" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="residualLikelihood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probabilité résiduelle</FormLabel>
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
      </div>
      
      <FormField
        control={control}
        name="residualRiskLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Niveau de risque résiduel</FormLabel>
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
              Niveau calculé automatiquement à partir de l'impact résiduel multiplié par la probabilité résiduelle
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
