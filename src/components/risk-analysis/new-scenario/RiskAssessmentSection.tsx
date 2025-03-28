
import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

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
  
  // Fonction pour vérifier les tables d'échelles dans la base de données
  const checkScaleTablesExist = useCallback(async () => {
    try {
      const { data: tables, error } = await supabase
        .from('company_risk_scales')
        .select('id')
        .eq('company_id', companyId)
        .limit(1);
      
      if (error) {
        console.error("Erreur lors de la vérification des tables d'échelles:", error);
        return false;
      }
      
      return tables && tables.length > 0;
    } catch (err) {
      console.error("Exception lors de la vérification des tables d'échelles:", err);
      return false;
    }
  }, [companyId]);
  
  // Force initialize risk scales with more robust error handling
  const initializeScales = useCallback(async () => {
    if (!companyId) return;
    
    setInitializing(true);
    setError(null);
    
    try {
      console.log("Initialisation des échelles pour l'entreprise:", companyId);
      
      // Vérifier si les tables d'échelles existent
      const tablesExist = await checkScaleTablesExist();
      console.log("Les tables d'échelles existent:", tablesExist);
      
      // Forcer la création des échelles par défaut
      const success = await ensureDefaultScalesExist(companyId);
      console.log("Résultat de l'initialisation des échelles:", success);
      
      if (success) {
        // Récupérer les échelles mises à jour
        const scales = await fetchCompanyRiskScales(companyId);
        console.log("Échelles récupérées après initialisation:", scales?.length || 0);
        
        if (!scales || !Array.isArray(scales) || scales.length === 0) {
          setError("Aucune échelle de risque n'a pu être initialisée pour cette entreprise");
          return;
        }
        
        // Identifier les échelles actives
        const activeImpactScale = scales.find(
          s => s.isActive && s.scaleType?.category === 'impact'
        );
        
        const activeLikelihoodScale = scales.find(
          s => s.isActive && s.scaleType?.category === 'likelihood'
        );
        
        console.log("Échelle d'impact active:", activeImpactScale?.id);
        console.log("Échelle de probabilité active:", activeLikelihoodScale?.id);
        
        setImpactScale(activeImpactScale || null);
        setLikelihoodScale(activeLikelihoodScale || null);
        
        toast({
          title: "Échelles initialisées",
          description: "Les échelles de risque ont été correctement initialisées",
        });
      } else {
        setError("Erreur lors de l'initialisation des échelles de risque");
        console.error("L'appel à ensureDefaultScalesExist a échoué");
      }
    } catch (error) {
      console.error('Erreur détaillée lors de l\'initialisation des échelles:', error);
      setError("Erreur technique lors de l'initialisation des échelles de risque");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'initialiser les échelles de risque",
      });
    } finally {
      setInitializing(false);
    }
  }, [companyId, ensureDefaultScalesExist, fetchCompanyRiskScales, toast, checkScaleTablesExist]);
  
  // Load risk scales for this company with improved error handling
  useEffect(() => {
    const loadRiskScales = async () => {
      if (!companyId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Chargement des échelles pour l'entreprise:", companyId);
        
        // Forcer la création des échelles par défaut
        await ensureDefaultScalesExist(companyId);
        
        // Récupérer les échelles
        const scales = await fetchCompanyRiskScales(companyId);
        console.log("Échelles récupérées:", scales?.length || 0);
        
        if (!scales || !Array.isArray(scales) || scales.length === 0) {
          console.error("Aucune échelle trouvée après le chargement");
          setError("Aucune échelle de risque n'a pu être chargée");
          return;
        }
        
        // Débogage: lister toutes les échelles et leurs catégories
        scales.forEach(scale => {
          console.log(`Échelle ${scale.id}: type=${scale.scaleType?.name}, catégorie=${scale.scaleType?.category}, active=${scale.isActive || scale.is_active}`);
          console.log(`Niveaux: ${scale.levels?.length || 0}`);
        });
        
        // Identifier les échelles actives
        const activeImpactScale = scales.find(
          s => (s.isActive || s.is_active) && s.scaleType?.category === 'impact'
        );
        
        const activeLikelihoodScale = scales.find(
          s => (s.isActive || s.is_active) && s.scaleType?.category === 'likelihood'
        );
        
        console.log("Échelle d'impact active:", activeImpactScale?.id);
        console.log("Échelle de probabilité active:", activeLikelihoodScale?.id);
        
        // Si aucune échelle active n'est trouvée, utiliser la première échelle de chaque catégorie
        const fallbackImpactScale = !activeImpactScale ? scales.find(s => s.scaleType?.category === 'impact') : null;
        const fallbackLikelihoodScale = !activeLikelihoodScale ? scales.find(s => s.scaleType?.category === 'likelihood') : null;
        
        if (fallbackImpactScale) {
          console.log("Utilisation de l'échelle d'impact de secours:", fallbackImpactScale.id);
        }
        
        if (fallbackLikelihoodScale) {
          console.log("Utilisation de l'échelle de probabilité de secours:", fallbackLikelihoodScale.id);
        }
        
        setImpactScale(activeImpactScale || fallbackImpactScale || null);
        setLikelihoodScale(activeLikelihoodScale || fallbackLikelihoodScale || null);
        
        if (!activeImpactScale && !fallbackImpactScale) {
          console.error("Aucune échelle d'impact trouvée");
        }
        
        if (!activeLikelihoodScale && !fallbackLikelihoodScale) {
          console.error("Aucune échelle de probabilité trouvée");
        }
      } catch (error) {
        console.error('Erreur détaillée lors du chargement des échelles:', error);
        setError("Erreur technique lors du chargement des échelles de risque");
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
