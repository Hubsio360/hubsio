import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  ChevronLeft,
  ArrowLeft,
  FileText,
  Loader2,
  Wand2
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { RiskScenario, RiskLevel } from '@/types';
import { EditRiskScenarioModalV2 } from '@/components/risk-analysis/EditRiskScenarioModalV2';
import { supabase } from '@/integrations/supabase/client';

const RiskScenarioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentScenario, setCurrentScenario] = useState<RiskScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [generatingImpact, setGeneratingImpact] = useState(false);
  const dataContext = useData();
  const { toast } = useToast();

  const fetchScenarioData = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      const { riskScenarios, fetchRiskScenariosByCompanyId } = dataContext;
      
      let scenario = riskScenarios.find(s => s.id === id);
      
      if (!scenario && currentScenario?.companyId) {
        await fetchRiskScenariosByCompanyId(currentScenario.companyId);
        scenario = riskScenarios.find(s => s.id === id);
      } else if (!scenario) {
        const { data: scenarioData, error: scenarioError } = await supabase
          .from('risk_scenarios')
          .select('*')
          .eq('id', id)
          .single();

        if (scenarioError) {
          console.error("Error fetching scenario from Supabase:", scenarioError);
          throw new Error(scenarioError.message);
        }

        if (scenarioData) {
          scenario = {
            id: scenarioData.id,
            companyId: scenarioData.company_id,
            name: scenarioData.name,
            description: scenarioData.description,
            impactDescription: scenarioData.impact_description,
            impactLevel: scenarioData.impact_level,
            likelihood: scenarioData.likelihood,
            riskLevel: scenarioData.risk_level,
            status: scenarioData.status,
            scope: scenarioData.scope,
            rawImpact: scenarioData.impact_level,
            rawLikelihood: scenarioData.likelihood,
            rawRiskLevel: scenarioData.risk_level,
            residualImpact: scenarioData.residual_impact as RiskLevel || 'low',
            residualLikelihood: scenarioData.residual_likelihood as RiskLevel || 'low',
            residualRiskLevel: scenarioData.residual_risk_level as RiskLevel || 'low',
            threatId: scenarioData.threat_id,
            vulnerabilityId: scenarioData.vulnerability_id,
            securityMeasures: (scenarioData.security_measures as string) || '',
            measureEffectiveness: (scenarioData.measure_effectiveness as string) || '',
            impactScaleRatings: scenarioData.impact_scale_ratings && 
              typeof scenarioData.impact_scale_ratings === 'object' ? 
              scenarioData.impact_scale_ratings as Record<string, RiskLevel> : 
              {},
            createdAt: scenarioData.created_at,
            updatedAt: scenarioData.updated_at
          };

          await fetchRiskScenariosByCompanyId(scenario.companyId);
        }
      }
      
      if (scenario) {
        setCurrentScenario(scenario);
      } else {
        console.error("Could not find scenario with ID:", id);
        toast({
          title: "Erreur",
          description: "Impossible de trouver le scénario demandé",
          variant: "destructive",
        });
        
        if (currentScenario?.companyId) {
          navigate(`/risk-analysis/${currentScenario.companyId}`);
        } else {
          navigate('/risk-analysis');
        }
      }
    } catch (error) {
      console.error('Error fetching scenario:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails du scénario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, navigate, currentScenario?.companyId, dataContext]);

  useEffect(() => {
    fetchScenarioData();
  }, [fetchScenarioData]);

  const handleSaveScenario = async (data: Partial<RiskScenario>): Promise<boolean> => {
    if (!currentScenario || !id) return false;
    
    try {
      const processedData = {
        ...data,
        threatId: data.threatId === "none" ? null : data.threatId,
        vulnerabilityId: data.vulnerabilityId === "none" ? null : data.vulnerabilityId
      };
      
      const { updateRiskScenario } = dataContext;
      const updatedScenario = await updateRiskScenario(id, processedData);
      
      if (!updatedScenario) {
        throw new Error("Failed to update scenario");
      }
      
      setCurrentScenario(prev => prev ? {...prev, ...processedData} : null);
      
      return true;
    } catch (error) {
      console.error("Error updating scenario:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le scénario",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteScenario = async () => {
    if (!currentScenario) return;
    
    try {
      const { deleteRiskScenario } = dataContext;
      await deleteRiskScenario(currentScenario.id);
      toast({
        title: "Succès",
        description: "Scénario de risque supprimé avec succès",
      });
      navigate(`/risk-analysis/${currentScenario.companyId}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le scénario",
        variant: "destructive",
      });
    }
  };

  const generateImpactDescription = async () => {
    if (!currentScenario || !currentScenario.description) {
      toast({
        title: "Erreur",
        description: "La description du scénario est requise pour générer un impact",
        variant: "destructive",
      });
      return;
    }

    setGeneratingImpact(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-impact-description', {
        body: { scenarioDescription: currentScenario.description },
      });

      if (error) throw error;

      if (data.impactDescription) {
        const { updateRiskScenario } = dataContext;
        const success = await updateRiskScenario(currentScenario.id, {
          impactDescription: data.impactDescription
        });

        if (success) {
          setCurrentScenario({
            ...currentScenario,
            impactDescription: data.impactDescription
          });

          toast({
            title: "Succès",
            description: "Description de l'impact générée avec succès",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la description de l'impact:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la description de l'impact",
        variant: "destructive",
      });
    } finally {
      setGeneratingImpact(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du scénario...</span>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-warning mb-4" />
            <h2 className="text-xl font-semibold mb-2">Scénario non trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Le scénario de risque que vous cherchez n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate(-1)}>
              Retourner à l'analyse de risque
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/risk-analysis/${currentScenario.companyId}`)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour à l'analyse
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Le scénario de risque sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteScenario}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{currentScenario.name}</CardTitle>
              <CardDescription>
                Scénario de risque - ID: {currentScenario.id}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="capitalize">
                {currentScenario.scope}
              </Badge>
              <Badge 
                variant={
                  currentScenario.riskLevel === 'low' ? 'secondary' :
                  currentScenario.riskLevel === 'medium' ? 'outline' :
                  currentScenario.riskLevel === 'high' ? 'default' : 'destructive'
                }
              >
                {currentScenario.riskLevel === 'low' ? 'Faible' :
                 currentScenario.riskLevel === 'medium' ? 'Moyen' :
                 currentScenario.riskLevel === 'high' ? 'Élevé' : 'Critique'}
              </Badge>
              <Badge 
                variant="outline" 
                className="capitalize"
              >
                {currentScenario.status === 'identified' ? 'Identifié' :
                 currentScenario.status === 'analyzed' ? 'Analysé' :
                 currentScenario.status === 'treated' ? 'Traité' :
                 currentScenario.status === 'accepted' ? 'Accepté' : 'Surveillé'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {currentScenario.description || "Aucune description fournie."}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Description de l'impact</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateImpactDescription}
                disabled={generatingImpact || !currentScenario.description}
              >
                {generatingImpact ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Générer avec IA
                  </>
                )}
              </Button>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {currentScenario.impactDescription || "Aucune description d'impact fournie."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact</h4>
              <p className="text-xl font-semibold capitalize">
                {currentScenario.impactLevel === 'low' ? 'Faible' :
                 currentScenario.impactLevel === 'medium' ? 'Moyen' :
                 currentScenario.impactLevel === 'high' ? 'Élevé' : 'Critique'}
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité</h4>
              <p className="text-xl font-semibold capitalize">
                {currentScenario.likelihood === 'low' ? 'Faible' :
                 currentScenario.likelihood === 'medium' ? 'Moyen' :
                 currentScenario.likelihood === 'high' ? 'Élevé' : 'Critique'}
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-4 border">
              <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque</h4>
              <p className={`text-xl font-semibold capitalize ${
                currentScenario.riskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
                currentScenario.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                currentScenario.riskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {currentScenario.riskLevel === 'low' ? 'Faible' :
                 currentScenario.riskLevel === 'medium' ? 'Moyen' :
                 currentScenario.riskLevel === 'high' ? 'Élevé' : 'Critique'}
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="raw" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw">Évaluation brute</TabsTrigger>
              <TabsTrigger value="residual">Évaluation résiduelle</TabsTrigger>
            </TabsList>
            
            <TabsContent value="raw" className="space-y-4 p-4 border rounded-md mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact brut</h4>
                  <p className="text-xl font-semibold capitalize">
                    {currentScenario.rawImpact === 'low' ? 'Faible' :
                     currentScenario.rawImpact === 'medium' ? 'Moyen' :
                     currentScenario.rawImpact === 'high' ? 'Élevé' : 'Critique'}
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité brute</h4>
                  <p className="text-xl font-semibold capitalize">
                    {currentScenario.rawLikelihood === 'low' ? 'Faible' :
                     currentScenario.rawLikelihood === 'medium' ? 'Moyen' :
                     currentScenario.rawLikelihood === 'high' ? 'Élevé' : 'Critique'}
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque brut</h4>
                  <p className={`text-xl font-semibold capitalize ${
                    currentScenario.rawRiskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
                    currentScenario.rawRiskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    currentScenario.rawRiskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {currentScenario.rawRiskLevel === 'low' ? 'Faible' :
                     currentScenario.rawRiskLevel === 'medium' ? 'Moyen' :
                     currentScenario.rawRiskLevel === 'high' ? 'Élevé' : 'Critique'}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="residual" className="space-y-4 p-4 border rounded-md mt-2">
              <div>
                <h3 className="text-lg font-medium mb-2">Mesures de sécurité</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {currentScenario.securityMeasures || "Aucune mesure de sécurité spécifiée."}
                </p>
                
                <h3 className="text-lg font-medium mb-2">Efficacité des mesures</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {currentScenario.measureEffectiveness || "Aucune évaluation de l'efficacité des mesures."}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact résiduel</h4>
                  <p className="text-xl font-semibold capitalize">
                    {currentScenario.residualImpact === 'low' ? 'Faible' :
                     currentScenario.residualImpact === 'medium' ? 'Moyen' :
                     currentScenario.residualImpact === 'high' ? 'Élevé' : 'Critique'}
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité résiduelle</h4>
                  <p className="text-xl font-semibold capitalize">
                    {currentScenario.residualLikelihood === 'low' ? 'Faible' :
                     currentScenario.residualLikelihood === 'medium' ? 'Moyen' :
                     currentScenario.residualLikelihood === 'high' ? 'Élevé' : 'Critique'}
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque résiduel</h4>
                  <p className={`text-xl font-semibold capitalize ${
                    currentScenario.residualRiskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
                    currentScenario.residualRiskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    currentScenario.residualRiskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {currentScenario.residualRiskLevel === 'low' ? 'Faible' :
                     currentScenario.residualRiskLevel === 'medium' ? 'Moyen' :
                     currentScenario.residualRiskLevel === 'high' ? 'Élevé' : 'Critique'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <EditRiskScenarioModalV2
        open={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          
          if (!open) {
            fetchScenarioData();
          }
        }}
        scenario={currentScenario}
        onSave={handleSaveScenario}
      />
    </div>
  );
};

export default RiskScenarioDetail;
