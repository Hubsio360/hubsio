
import React from 'react';
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { RiskScaleLevel, RiskScaleWithLevels } from '@/types/risk-scales';
import { RiskLevel } from '@/types';
import RiskScaleSlider from './RiskScaleSlider';
import { cn } from '@/lib/utils';

interface RawRiskAssessmentProps {
  form: any;
  likelihoodScale: RiskScaleWithLevels | null;
  impactScales: RiskScaleWithLevels[];
  activeImpactScale: string | null;
  setActiveImpactScale: (id: string) => void;
  impactScaleRatings: Record<string, RiskLevel>;
  handleImpactScaleChange: (scaleId: string, value: RiskLevel) => void;
}

// Fonction pour obtenir la couleur correspondant au niveau de risque
const getRiskLevelColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'low': return "#4CAF50"; // vert
    case 'medium': return "#FFA726"; // jaune
    case 'high': return "#9C27B0"; // violet
    case 'critical': return "#F44336"; // rouge
    default: return "#e2e8f0"; // gris par défaut
  }
};

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
  const riskLevelColor = getRiskLevelColor(rawRiskLevel);

  return (
    <div className="space-y-8">
      {likelihoodScale && likelihoodScale.levels && likelihoodScale.levels.length > 0 && (
        <div className="bg-black/20 p-6 rounded-lg border border-white/10">
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
        </div>
      )}

      {/* Impact Scales */}
      {impactScales.length > 0 && (
        <div className="bg-black/20 p-6 rounded-lg border border-white/10 space-y-6">
          <FormLabel className="text-lg">Impact</FormLabel>
          <div className="flex flex-wrap gap-2 mb-6">
            {impactScales.map(scale => (
              <Badge 
                key={scale.id}
                variant={activeImpactScale === scale.id ? "default" : "outline"}
                className={cn("cursor-pointer text-sm px-3 py-1", 
                  activeImpactScale === scale.id ? "bg-primary" : "hover:bg-secondary/50"
                )}
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
      
      <FormItem className="bg-black/20 p-6 rounded-lg border border-white/10">
        <FormLabel className="text-lg">Niveau de risque brut</FormLabel>
        <div className="flex items-start mt-4">
          <Badge className="text-lg px-4 py-2 h-auto mr-4" style={{
            backgroundColor: riskLevelColor,
            color: riskLevelColor === "#4CAF50" || riskLevelColor === "#FFA726" ? "#000" : "#fff"
          }}>
            {rawRiskLevel.toUpperCase()}
          </Badge>
          <FormDescription className="mt-1 text-sm">
            Niveau calculé automatiquement à partir de l'impact et de la probabilité. Ce niveau indique la gravité du risque avant la mise en place de mesures de sécurité.
          </FormDescription>
        </div>
      </FormItem>
    </div>
  );
};

export default RawRiskAssessment;
