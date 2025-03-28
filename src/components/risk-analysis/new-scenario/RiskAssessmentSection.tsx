
import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  FormItem, 
  FormField, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { UseFormReturn } from 'react-hook-form';
import { RiskLevel } from '@/types';

interface RiskAssessmentSectionProps {
  form: UseFormReturn<any>;
}

const riskLevelOptions: { value: RiskLevel, label: string }[] = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Modéré' },
  { value: 'high', label: 'Élevé' },
  { value: 'critical', label: 'Critique' }
];

const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({ form }) => {
  return (
    <div className="space-y-6 mt-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Évaluation du risque brut</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Évaluez le risque sans tenir compte (ou en tenant compte de façon minimale) des mesures de sécurité existantes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rawLikelihood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probabilité brute</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {riskLevelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rawImpact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact brut</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {riskLevelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="securityMeasures"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Mesures de sécurité existantes ou planifiées</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez les mesures de sécurité actuelles ou planifiées"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-2">Évaluation du risque résiduel</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Évaluez le risque après prise en compte des mesures de sécurité actuelles ou planifiées.
        </p>
        
        <FormField
          control={form.control}
          name="measureEffectiveness"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Efficacité des mesures</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Évaluez l'efficacité des mesures de sécurité"
                  className="min-h-[80px]"
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
            name="residualLikelihood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probabilité résiduelle</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {riskLevelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="residualImpact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact résiduel</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {riskLevelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentSection;
