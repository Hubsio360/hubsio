
import React from 'react';
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { RiskScaleLevel, RiskScaleWithLevels } from '@/types/risk-scales';
import { RiskLevel } from '@/types';
import RiskScaleSlider from './RiskScaleSlider';

interface RawRiskAssessmentProps {
  form: any;
  likelihoodScale: RiskScaleWithLevels | null;
  impactScales: RiskScaleWithLevels[];
  activeImpactScale: string | null;
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
  return (
    <div className="space-y-4">
      {likelihoodScale && likelihoodScale.levels && likelihoodScale.levels.length > 0 && (
        <FormField
          control={form.control}
          name="rawLikelihood"
          render={({ field }) => (
            <RiskScaleSlider
              name="rawLikelihood"
              label="Probabilité"
              description="Évaluez la probabilité que ce scénario de risque se produise"
              levels={likelihoodScale.levels}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}

      {/* Impact Scales */}
      {impactScales.length > 0 && (
        <div className="space-y-4">
          <FormLabel>Impact</FormLabel>
          <div className="flex flex-wrap gap-2 mb-4">
            {impactScales.map(scale => (
              <Badge 
                key={scale.id}
                variant={activeImpactScale === scale.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveImpactScale(scale.id)}
              >
                {scale.scaleType?.name}
              </Badge>
            ))}
          </div>
          
          {/* Active impact scale - each scale now gets its own slider with its own stored value */}
          {activeImpactScale && (
            <div className="pt-2">
              {impactScales.map(scale => {
                if (scale.id === activeImpactScale && scale.levels && scale.levels.length > 0) {
                  // Get the current value for this specific scale
                  const scaleValue = impactScaleRatings[scale.id] || form.watch('rawImpact') || 'low';
                  
                  return (
                    <div key={scale.id}>
                      <FormField
                        control={form.control}
                        // Using `impactScaleRatings` path with the scale ID for proper form registration
                        name={`impactScaleRatings.${scale.id}` as any}
                        render={() => (
                          <RiskScaleSlider
                            name={`impactScale_${scale.id}`}
                            label={`Impact - ${scale.scaleType?.name}`}
                            description={scale.scaleType?.description || "Évaluez l'impact potentiel de ce scénario de risque"}
                            levels={scale.levels}
                            value={scaleValue as RiskLevel}
                            onChange={(value) => handleImpactScaleChange(scale.id, value)}
                          />
                        )}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}
      
      <FormItem className="pt-2">
        <FormLabel>Niveau de risque brut</FormLabel>
        <div className="flex items-center mt-2">
          <Badge variant="outline" className="text-lg px-3 py-1.5 h-auto">
            {form.watch('rawRiskLevel').toUpperCase()}
          </Badge>
          <FormDescription className="ml-4">
            Niveau calculé automatiquement à partir de l'impact et de la probabilité
          </FormDescription>
        </div>
      </FormItem>
    </div>
  );
};

export default RawRiskAssessment;
