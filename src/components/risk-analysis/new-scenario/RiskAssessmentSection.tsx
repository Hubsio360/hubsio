
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
import { useData } from '@/contexts/DataContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import RiskScaleSlider from './RiskScaleSlider';
import { RiskScaleWithLevels } from '@/types/risk-scales';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RiskAssessmentSectionProps {
  form: UseFormReturn<any>;
  companyId: string;
}

const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({ form, companyId }) => {
  const { companyRiskScales, fetchCompanyRiskScales, ensureDefaultScalesExist } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [impactScale, setImpactScale] = useState<RiskScaleWithLevels | null>(null);
  const [likelihoodScale, setLikelihoodScale] = useState<RiskScaleWithLevels | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  console.log("Scales in component:", companyRiskScales);
  
  // Find active impact and likelihood scales
  const findActiveScales = (scales: RiskScaleWithLevels[]) => {
    if (!scales || !Array.isArray(scales)) {
      console.error("No scales or invalid scales format:", scales);
      return { activeImpactScale: null, activeLikelihoodScale: null };
    }
    
    console.log("Finding active scales among:", scales.length, "scales");
    
    const activeImpactScale = scales.find(
      s => s.isActive && s.scaleType?.category === 'impact'
    ) || null;
    
    const activeLikelihoodScale = scales.find(
      s => s.isActive && s.scaleType?.category === 'likelihood'
    ) || null;
    
    console.log("Impact scale:", activeImpactScale);
    console.log("Likelihood scale:", activeLikelihoodScale);
    
    return { activeImpactScale, activeLikelihoodScale };
  };
  
  // Force initialize risk scales
  const initializeScales = async () => {
    if (!companyId) return;
    
    setInitializing(true);
    setError(null);
    
    try {
      // Create default scales
      await ensureDefaultScalesExist(companyId);
      // Fetch updated scales
      const scales = await fetchCompanyRiskScales(companyId);
      
      if (!scales || !Array.isArray(scales) || scales.length === 0) {
        setError("Aucune échelle de risque trouvée pour cette entreprise");
        return;
      }
      
      // Update UI with new scales
      const { activeImpactScale, activeLikelihoodScale } = findActiveScales(scales);
      setImpactScale(activeImpactScale);
      setLikelihoodScale(activeLikelihoodScale);
      
      toast({
        title: "Échelles initialisées",
        description: "Les échelles de risque ont été correctement initialisées",
      });
    } catch (error) {
      console.error('Error initializing risk scales:', error);
      setError("Erreur lors de l'initialisation des échelles de risque");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'initialiser les échelles de risque",
      });
    } finally {
      setInitializing(false);
    }
  };
  
  // Load risk scales for this company
  useEffect(() => {
    const loadRiskScales = async () => {
      if (!companyId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Loading risk scales for company:", companyId);
        // Ensure default scales exist for this company
        await ensureDefaultScalesExist(companyId);
        const scales = await fetchCompanyRiskScales(companyId);
        console.log("Fetched scales:", scales);
        
        if (!scales || scales.length === 0) {
          setError("Aucune échelle de risque n'a pu être chargée");
          return;
        }
        
        // Find active scales
        const { activeImpactScale, activeLikelihoodScale } = findActiveScales(scales);
        setImpactScale(activeImpactScale);
        setLikelihoodScale(activeLikelihoodScale);
      } catch (error) {
        console.error('Error loading risk scales:', error);
        setError("Erreur lors du chargement des échelles de risque");
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
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={initializeScales}
                  disabled={initializing}
                >
                  {initializing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initialisation...
                    </>
                  ) : (
                    "Réinitialiser les échelles"
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (!impactScale || !likelihoodScale) ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Échelles de risque manquantes</AlertTitle>
            <AlertDescription>
              Les échelles de risque ne sont pas correctement configurées pour cette entreprise.
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={initializeScales}
                  disabled={initializing}
                >
                  {initializing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initialisation...
                    </>
                  ) : (
                    "Initialiser les échelles"
                  )}
                </Button>
              </div>
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
        
        {!isLoading && !error && (impactScale && likelihoodScale) && (
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
