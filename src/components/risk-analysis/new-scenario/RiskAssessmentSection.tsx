
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RiskScaleLevel, RiskScaleWithLevels } from '@/types/risk-scales';
import { UseFormReturn } from 'react-hook-form';
import { useData } from '@/contexts/DataContext';
import RiskScaleSlider from './RiskScaleSlider';
import { Badge } from '@/components/ui/badge';
import { Shield, Gauge } from 'lucide-react';
import { RiskScenarioFormValues } from './RiskScenarioForm';

interface RiskAssessmentSectionProps {
  form: UseFormReturn<RiskScenarioFormValues>;
  companyId: string;
}

const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({ form, companyId }) => {
  const { companyRiskScales, loading, fetchCompanyRiskScales, ensureDefaultScalesExist } = useData();
  const [impactScales, setImpactScales] = useState<RiskScaleWithLevels[]>([]);
  const [likelihoodScale, setLikelihoodScale] = useState<RiskScaleWithLevels | null>(null);
  const [activeImpactScale, setActiveImpactScale] = useState<string | null>(null);

  useEffect(() => {
    const loadScales = async () => {
      // Ensure default scales exist for this company
      await ensureDefaultScalesExist(companyId);
      
      // Fetch company risk scales
      await fetchCompanyRiskScales(companyId);
    };
    
    loadScales();
  }, [companyId, fetchCompanyRiskScales, ensureDefaultScalesExist]);

  useEffect(() => {
    if (companyRiskScales && companyRiskScales.length > 0) {
      // Filter active scales by category
      const activeScales = companyRiskScales.filter(scale => scale.isActive || scale.is_active);
      
      // Get impact scales
      const impacts = activeScales.filter(scale => {
        const category = scale.scaleType?.category || '';
        return category.includes('impact') || 
               !category.includes('likelihood'); // Consider scales without specific category as impact
      });
      
      // Get likelihood scale
      const likelihood = activeScales.find(scale => {
        const category = scale.scaleType?.category || '';
        return category.includes('likelihood');
      });
      
      setImpactScales(impacts);
      setLikelihoodScale(likelihood || null);
      
      // Set the first impact scale as active if there is one and no active scale is set
      if (impacts.length > 0 && !activeImpactScale) {
        setActiveImpactScale(impacts[0].id);
      }
    }
  }, [companyRiskScales, activeImpactScale]);

  // If no scales are available, show a message
  if ((loading && loading.companyRiskScales) || (!impactScales.length && !likelihoodScale)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="mr-2 h-5 w-5" />
            Évaluation du risque
          </CardTitle>
          <CardDescription>
            Chargement des échelles de risque...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="mr-2 h-5 w-5" />
            Évaluation du risque
          </CardTitle>
          <CardDescription>
            Évaluez les niveaux d'impact et de probabilité pour ce scénario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="raw" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw">Risque brut</TabsTrigger>
              <TabsTrigger value="residual">Risque résiduel</TabsTrigger>
            </TabsList>
            
            <TabsContent value="raw" className="space-y-6 pt-4">
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

                {/* Impact Scales Tabs */}
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
                    
                    {/* Active impact scale */}
                    {activeImpactScale && (
                      <div className="pt-2">
                        {impactScales.map(scale => {
                          if (scale.id === activeImpactScale && scale.levels && scale.levels.length > 0) {
                            return (
                              <div key={scale.id}>
                                <FormField
                                  control={form.control}
                                  name="rawImpact"
                                  render={({ field }) => (
                                    <RiskScaleSlider
                                      name="rawImpact"
                                      label={`Impact - ${scale.scaleType?.name}`}
                                      description={scale.scaleType?.description || "Évaluez l'impact potentiel de ce scénario de risque"}
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
            </TabsContent>
            
            <TabsContent value="residual" className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="securityMeasures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mesures de sécurité</FormLabel>
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
                    <FormLabel>Efficacité des mesures</FormLabel>
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
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
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
                {impactScales.length > 0 && (
                  <div className="space-y-4">
                    <FormLabel>Impact résiduel</FormLabel>
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
                
                <FormItem className="pt-2">
                  <FormLabel>Niveau de risque résiduel</FormLabel>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessmentSection;
