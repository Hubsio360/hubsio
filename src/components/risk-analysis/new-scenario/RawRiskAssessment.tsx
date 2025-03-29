
import React, { useEffect, useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { RiskScaleWithLevels } from '@/types/risk-scales';
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
  // Log available impact scales on mount
  useEffect(() => {
    if (impactScales.length > 0) {
      console.log("RawRiskAssessment: Available impact scales:", impactScales.map(scale => ({
        id: scale.id,
        name: scale.scaleType?.name,
        active: scale.id === activeImpactScale
      })));
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      console.log("RawRiskAssessment: Component unmounting, cleaning up");
    };
  }, [impactScales, activeImpactScale]);

  // Memoize the select impact scale function to prevent unnecessary re-renders
  const selectImpactScale = useCallback((scaleId: string) => {
    console.log(`RawRiskAssessment: Selecting impact scale ${scaleId}`);
    setActiveImpactScale(scaleId);
  }, [setActiveImpactScale]);

  return (
    <div className="space-y-8">
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
              onChange={(newValue) => {
                console.log(`RawRiskAssessment: Updating rawLikelihood to ${newValue}`);
                field.onChange(newValue);
              }}
            />
          )}
        />
      )}

      {/* Impact Scales */}
      {impactScales.length > 0 && (
        <div className="space-y-6 pt-2">
          <FormLabel className="text-lg font-medium">Impact</FormLabel>
          <div className="flex flex-wrap gap-2 mb-6">
            {impactScales.map(scale => (
              <Badge 
                key={scale.id}
                variant={activeImpactScale === scale.id ? "default" : "outline"}
                className="cursor-pointer py-1.5 px-3 text-sm"
                onClick={() => selectImpactScale(scale.id)}
              >
                {scale.scaleType?.name || "Échelle d'impact"}
              </Badge>
            ))}
          </div>
          
          {/* Active impact scale */}
          {activeImpactScale && (
            <div className="pt-2">
              {impactScales.map(scale => {
                if (scale.id === activeImpactScale && scale.levels && scale.levels.length > 0) {
                  // Get the current value for this specific scale
                  const scaleValue = impactScaleRatings[scale.id] || 'low';
                  console.log(`RawRiskAssessment: Rendering impact scale ${scale.id} with value ${scaleValue}, name: ${scale.scaleType?.name}`);
                  
                  return (
                    <div key={scale.id}>
                      <RiskScaleSlider
                        name={`impactScale_${scale.id}`}
                        label={`Impact - ${scale.scaleType?.name || "Impact"}`}
                        description={scale.scaleType?.description || "Évaluez l'impact potentiel de ce scénario de risque"}
                        levels={scale.levels}
                        value={scaleValue}
                        onChange={(value) => {
                          console.log(`RawRiskAssessment: Updating impact scale ${scale.id} to ${value}`);
                          handleImpactScaleChange(scale.id, value);
                        }}
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
        <FormLabel className="text-lg font-medium">Niveau de risque brut</FormLabel>
        <div className="flex items-center mt-2">
          <Badge variant="outline" className="text-lg px-3 py-1.5 h-auto">
            {form.watch('rawRiskLevel').toUpperCase()}
          </Badge>
          <FormDescription className="ml-4">
            Niveau calculé automatiquement à partir de l'impact maximal multiplié par la probabilité.
          </FormDescription>
        </div>
      </FormItem>
    </div>
  );
};

export default RawRiskAssessment;
