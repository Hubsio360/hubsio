
import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  FormLabel, 
  FormItem, 
  FormField, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { UseFormReturn } from 'react-hook-form';
import { RiskLevel } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import RiskScaleSlider from './RiskScaleSlider';
import { RiskScaleWithLevels } from '@/types/risk-scales';

interface RiskAssessmentSectionProps {
  form: UseFormReturn<any>;
  companyId: string;
}

const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({ form, companyId }) => {
  const { companyRiskScales, fetchCompanyRiskScales, ensureDefaultScalesExist } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [impactScale, setImpactScale] = useState<RiskScaleWithLevels | null>(null);
  const [likelihoodScale, setLikelihoodScale] = useState<RiskScaleWithLevels | null>(null);
  
  console.log("Scales in component:", companyRiskScales);
  
  // Load risk scales for this company
  useEffect(() => {
    const loadRiskScales = async () => {
      setIsLoading(true);
      try {
        console.log("Loading risk scales for company:", companyId);
        // Ensure default scales exist for this company
        await ensureDefaultScalesExist(companyId);
        const scales = await fetchCompanyRiskScales(companyId);
        console.log("Fetched scales:", scales);
        
        // Find active impact and likelihood scales
        const activeImpactScale = scales.find(
          s => s.isActive && s.scaleType?.category === 'impact'
        ) || null;
        
        const activeLikelihoodScale = scales.find(
          s => s.isActive && s.scaleType?.category === 'likelihood'
        ) || null;
        
        console.log("Impact scale:", activeImpactScale);
        console.log("Likelihood scale:", activeLikelihoodScale);
        
        setImpactScale(activeImpactScale);
        setLikelihoodScale(activeLikelihoodScale);
      } catch (error) {
        console.error('Error loading risk scales:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (companyId) {
      loadRiskScales();
    }
  }, [companyId, fetchCompanyRiskScales, ensureDefaultScalesExist]);
  
  return (
    <div className="space-y-6 mt-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Évaluation du risque brut</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Évaluez le risque sans tenir compte (ou en tenant compte de façon minimale) des mesures de sécurité existantes.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <p>Chargement des échelles de risque...</p>
          </div>
        ) : (!impactScale || !likelihoodScale) ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Échelles de risque manquantes</AlertTitle>
            <AlertDescription>
              Les échelles de risque ne sont pas correctement configurées pour cette entreprise.
              Veuillez configurer les échelles d'impact et de probabilité.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rawLikelihood"
              render={({ field }) => (
                <RiskScaleSlider
                  levels={likelihoodScale.levels || []}
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Probabilité brute"
                  description="Évaluez la probabilité sans considérer les mesures de sécurité"
                />
              )}
            />
            
            <FormField
              control={form.control}
              name="rawImpact"
              render={({ field }) => (
                <RiskScaleSlider
                  levels={impactScale.levels || []}
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Impact brut"
                  description="Évaluez l'impact sans considérer les mesures de sécurité"
                />
              )}
            />
          </div>
        )}
        
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
        
        {!isLoading && (impactScale && likelihoodScale) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="residualLikelihood"
              render={({ field }) => (
                <RiskScaleSlider
                  levels={likelihoodScale.levels || []}
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Probabilité résiduelle"
                  description="Évaluez la probabilité après application des mesures de sécurité"
                />
              )}
            />
            
            <FormField
              control={form.control}
              name="residualImpact"
              render={({ field }) => (
                <RiskScaleSlider
                  levels={impactScale.levels || []}
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Impact résiduel"
                  description="Évaluez l'impact après application des mesures de sécurité"
                />
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAssessmentSection;
