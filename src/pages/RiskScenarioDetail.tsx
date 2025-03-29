
import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { RiskScenario } from '@/types';
import { EditRiskScenarioDialog } from '@/components/risk-analysis/EditRiskScenarioDialog';

const RiskScenarioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentScenario, setCurrentScenario] = useState<RiskScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { updateRiskScenario, deleteRiskScenario } = useData();
  const { toast } = useToast();

  // Fetch the risk scenario data
  useEffect(() => {
    const fetchScenarioData = async () => {
      if (!id) return;
      
      try {
        // This is an example implementation - you may need to adjust based on your actual data fetching
        const { fetchRiskScenarioById } = useData();
        if (fetchRiskScenarioById) {
          const scenario = await fetchRiskScenarioById(id);
          setCurrentScenario(scenario);
        } else {
          // Fallback to scenario data in local state
          console.warn('fetchRiskScenarioById not available');
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
    };

    fetchScenarioData();
  }, [id, toast]);

  const handleSaveScenario = (data: any) => {
    if (!currentScenario) return;
    
    // Convert "none" values to null or empty string based on your backend requirements
    const processedData = {
      ...data,
      threatId: data.threatId === "none" ? null : data.threatId,
      vulnerabilityId: data.vulnerabilityId === "none" ? null : data.vulnerabilityId
    };
    
    updateRiskScenario(currentScenario.id, processedData)
      .then((updatedScenario) => {
        setCurrentScenario(updatedScenario);
        toast({
          title: "Succès",
          description: "Scénario de risque mis à jour avec succès",
        });
        setIsEditing(false);
      })
      .catch((error) => {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le scénario",
          variant: "destructive",
        });
      });
  };

  const handleDeleteScenario = async () => {
    if (!currentScenario) return;
    
    try {
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
            <h3 className="text-lg font-medium mb-2">Description de l'impact</h3>
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
          
          {/* Risk Assessment Tabs */}
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
      
      {/* Edit Dialog */}
      <EditRiskScenarioDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        scenario={currentScenario}
        onSave={handleSaveScenario}
      />
    </div>
  );
};

export default RiskScenarioDetail;
