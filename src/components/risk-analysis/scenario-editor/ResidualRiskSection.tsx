
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
import { Textarea } from '@/components/ui/textarea';
import { RiskLevel } from '@/types';

export function ResidualRiskSection() {
  const { control, setValue } = useFormContext();
  
  // Watch residual impact and likelihood to calculate residual risk level
  const residualImpact = useWatch({ control, name: 'residualImpact' }) as RiskLevel;
  const residualLikelihood = useWatch({ control, name: 'residualLikelihood' }) as RiskLevel;
  
  // Calculate residual risk level when impact or likelihood changes
  useEffect(() => {
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
      
      const calculatedResidualRiskLevel = riskMatrix[residualImpact][residualLikelihood];
      setValue('residualRiskLevel', calculatedResidualRiskLevel);
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
            <FormLabel>Mesures de sécurité existantes ou envisagées</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Décrivez les mesures de sécurité qui sont ou seront mises en place" 
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="measureEffectiveness"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Efficacité des mesures</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Évaluez l'efficacité des mesures de sécurité" 
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectValue placeholder="Sélectionner un impact" />
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
                Niveau calculé automatiquement à partir de l'impact résiduel et de la probabilité résiduelle
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
