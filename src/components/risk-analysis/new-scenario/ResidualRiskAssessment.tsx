
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RiskScaleWithLevels } from '@/types/risk-scales';
import RiskScaleSlider from './RiskScaleSlider';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types';

interface ResidualRiskAssessmentProps {
  form: any;
  likelihoodScale: RiskScaleWithLevels | null;
  impactScales: RiskScaleWithLevels[];
  activeImpactScale: string | null;
  setActiveImpactScale: (id: string) => void;
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

const ResidualRiskAssessment: React.FC<ResidualRiskAssessmentProps> = ({
  form,
  likelihoodScale,
  impactScales,
  activeImpactScale,
  setActiveImpactScale
}) => {
  const residualRiskLevel = form.watch('residualRiskLevel');
  const riskLevelColor = getRiskLevelColor(residualRiskLevel);

  return (
    <div className="space-y-8 pt-4">
      <div className="bg-black/20 p-6 rounded-lg border border-white/10 space-y-4">
        <FormField
          control={form.control}
          name="securityMeasures"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Mesures de sécurité</FormLabel>
              <FormDescription>
                Décrivez les mesures de sécurité mises en place pour réduire ce risque
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Ex: Chiffrement des données, formation des utilisateurs..."
                  className="min-h-[100px] bg-black/20 border-white/10"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <div className="bg-black/20 p-6 rounded-lg border border-white/10 space-y-4">
        <FormField
          control={form.control}
          name="measureEffectiveness"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Efficacité des mesures</FormLabel>
              <FormDescription>
                Évaluez l'efficacité des mesures de sécurité mises en place
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Ex: Niveau d'efficacité, limites éventuelles..."
                  className="min-h-[80px] bg-black/20 border-white/10"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <Separator className="my-4 bg-white/10" />
      
      <div className="space-y-6">
        {likelihoodScale && likelihoodScale.levels && likelihoodScale.levels.length > 0 && (
          <div className="bg-black/20 p-6 rounded-lg border border-white/10">
            <FormField
              control={form.control}
              name="residualLikelihood"
              render={({ field }) => (
                <RiskScaleSlider
                  name="residualLikelihood"
                  label="Probabilité résiduelle"
                  description="Évaluez la probabilité résiduelle après application des mesures"
                  levels={likelihoodScale.levels}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        )}

        {/* Residual Impact Scales */}
        {impactScales.length > 0 && (
          <div className="bg-black/20 p-6 rounded-lg border border-white/10 space-y-6">
            <FormLabel className="text-lg">Impact résiduel</FormLabel>
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
            
            {/* Active residual impact scale */}
            {activeImpactScale && (
              <div className="pt-2">
                {impactScales.map(scale => {
                  if (scale.id === activeImpactScale && scale.levels && scale.levels.length > 0) {
                    return (
                      <div key={scale.id}>
                        <FormField
                          control={form.control}
                          name="residualImpact"
                          render={({ field }) => (
                            <RiskScaleSlider
                              name="residualImpact"
                              label={`Impact résiduel - ${scale.scaleType?.name}`}
                              description={`Évaluez l'impact résiduel après application des mesures (${scale.scaleType?.description || ""})`}
                              levels={scale.levels}
                              value={field.value}
                              onChange={field.onChange}
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
          <FormLabel className="text-lg">Niveau de risque résiduel</FormLabel>
          <div className="flex items-start mt-4">
            <Badge className="text-lg px-4 py-2 h-auto mr-4" style={{
              backgroundColor: riskLevelColor,
              color: riskLevelColor === "#4CAF50" || riskLevelColor === "#FFA726" ? "#000" : "#fff"
            }}>
              {residualRiskLevel.toUpperCase()}
            </Badge>
            <FormDescription className="mt-1 text-sm">
              Niveau calculé automatiquement à partir de l'impact et de la probabilité résiduels.
              Ce niveau représente la gravité du risque après application des mesures de sécurité.
            </FormDescription>
          </div>
        </FormItem>
      </div>
    </div>
  );
};

export default ResidualRiskAssessment;
