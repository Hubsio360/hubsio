
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RiskScaleWithLevels } from '@/types/risk-scales';
import RiskScaleSlider from './RiskScaleSlider';
import { RiskLevel } from '@/types';

interface ResidualRiskAssessmentProps {
  form: any;
  likelihoodScale: RiskScaleWithLevels | null;
  impactScales: RiskScaleWithLevels[];
  activeImpactScale: string | null;
  setActiveImpactScale: (id: string) => void;
  impactScaleRatings: Record<string, RiskLevel>;
  handleImpactScaleChange: (scaleId: string, value: RiskLevel) => void;
}

const ResidualRiskAssessment: React.FC<ResidualRiskAssessmentProps> = ({
  form,
  likelihoodScale,
  impactScales,
  activeImpactScale,
  setActiveImpactScale,
  impactScaleRatings,
  handleImpactScaleChange
}) => {
  // Créer un gestionnaire spécifique pour l'impact résiduel
  const handleResidualImpactChange = (value: RiskLevel) => {
    if (activeImpactScale) {
      // Mettre à jour à la fois l'impact spécifique et l'impact résiduel global
      handleImpactScaleChange(activeImpactScale, value);
      form.setValue('residualImpact', value);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <FormField
        control={form.control}
        name="securityMeasures"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-medium">Mesures de sécurité</FormLabel>
            <FormDescription>
              Décrivez les mesures de sécurité mises en place pour réduire ce risque
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="Ex: Chiffrement des données, formation des utilisateurs..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="measureEffectiveness"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-medium">Efficacité des mesures</FormLabel>
            <FormDescription>
              Évaluez l'efficacité des mesures de sécurité mises en place
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="Ex: Niveau d'efficacité, limites éventuelles..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <Separator className="my-6" />
      
      <div className="space-y-8">
        {likelihoodScale && likelihoodScale.levels && likelihoodScale.levels.length > 0 && (
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
        )}

        {/* Residual Impact Scales */}
        {impactScales.length > 0 && activeImpactScale && (
          <div className="space-y-6">
            <FormLabel className="text-lg font-medium">Impact résiduel</FormLabel>
            <div className="flex flex-wrap gap-2 mb-6">
              {impactScales.map(scale => (
                <Badge 
                  key={scale.id}
                  variant={activeImpactScale === scale.id ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3 text-sm"
                  onClick={() => setActiveImpactScale(scale.id)}
                >
                  {scale.scaleType?.name}
                </Badge>
              ))}
            </div>
            
            {/* Active residual impact scale */}
            <div className="pt-2">
              {impactScales.map(scale => {
                if (scale.id === activeImpactScale && scale.levels && scale.levels.length > 0) {
                  // Utiliser l'impact résiduel global comme valeur pour tous les échelles
                  const residualImpact = form.watch('residualImpact');
                  
                  return (
                    <div key={scale.id}>
                      <RiskScaleSlider
                        name={`residualImpact_${scale.id}`}
                        label={`Impact résiduel - ${scale.scaleType?.name}`}
                        description={`Évaluez l'impact résiduel après application des mesures (${scale.scaleType?.description || ""})`}
                        levels={scale.levels}
                        value={residualImpact}
                        onChange={handleResidualImpactChange}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
        
        <FormItem className="pt-2">
          <FormLabel className="text-lg font-medium">Niveau de risque résiduel</FormLabel>
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="text-lg px-3 py-1.5 h-auto">
              {form.watch('residualRiskLevel').toUpperCase()}
            </Badge>
            <FormDescription className="ml-4">
              Niveau calculé automatiquement à partir de l'impact et de la probabilité résiduels
            </FormDescription>
          </div>
        </FormItem>
      </div>
    </div>
  );
};

export default ResidualRiskAssessment;
