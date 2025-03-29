import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RiskScenarioFormValues } from './RiskScenarioForm';
import RiskLevelIndicator from './RiskLevelIndicator';
import { Info } from 'lucide-react';
import { RiskScaleLevel, RiskScaleWithLevels } from '@/types/risk-scales';
import RiskScaleSlider from './RiskScaleSlider';
import { RiskLevel } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RawRiskAssessmentProps {
  form: UseFormReturn<RiskScenarioFormValues>;
  likelihoodScale: RiskScaleWithLevels | null;
  impactScales: RiskScaleWithLevels[];
  activeImpactScale: string;
  setActiveImpactScale: (id: string) => void;
  impactScaleRatings: Record<string, RiskLevel>;
  handleImpactScaleChange: (scaleId: string, value: RiskLevel) => void;
}

const RawRiskAssessment: React.FC<RawRiskAssessmentProps> = ({
  form,
  likelihoodScale,
  impactScales,
  activeImpactScale,
  setActiveImpactScale,
  impactScaleRatings,
  handleImpactScaleChange
}) => {
  const rawRiskLevel = form.watch('rawRiskLevel');
  const rawImpact = form.watch('rawImpact');
  const rawLikelihood = form.watch('rawLikelihood');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {likelihoodScale && (
            <RiskScaleSlider
              label="Probabilité"
              value={rawLikelihood}
              onChange={(value) => form.setValue('rawLikelihood', value as RiskLevel)}
              levels={likelihoodScale.levels as RiskScaleLevel[]}
            />
          )}
        </div>
        
        <div className="space-y-4">
          {impactScales && impactScales.length > 0 && (
            <>
              {impactScales.length === 1 ? (
                <RiskScaleSlider
                  label="Impact"
                  value={rawImpact}
                  onChange={(value) => form.setValue('rawImpact', value as RiskLevel)}
                  levels={impactScales[0].levels as RiskScaleLevel[]}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="impactLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'impact</FormLabel>
                      <Select onValueChange={(value) => {
                          field.onChange(value);
                          setActiveImpactScale(value);
                        }} defaultValue={activeImpactScale}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type d'impact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {impactScales.map((scale) => (
                            <SelectItem key={scale.id} value={scale.id}>
                              {scale.scaleType?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium flex items-center">
            <Info className="w-4 h-4 mr-1" />
            Niveau de risque brut
          </div>
          
          <RiskLevelIndicator level={rawRiskLevel} />
        </div>
        
        <div className="pt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Méthode de calcul :</strong> Le niveau de risque est calculé en multipliant les valeurs numériques 
            d'impact (1 à 4) et de probabilité (1 à 4), puis en classifiant le score obtenu selon les seuils suivants :
            <br />
            • <strong>Faible</strong> : score ≤ 2
            <br />
            • <strong>Moyen</strong> : 2 &lt; score ≤ 6
            <br />
            • <strong>Élevé</strong> : 6 &lt; score ≤ 9
            <br />
            • <strong>Critique</strong> : score &gt; 9
          </p>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="securityMeasures"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mesures de sécurité existantes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Décrivez les mesures de sécurité existantes..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default RawRiskAssessment;
