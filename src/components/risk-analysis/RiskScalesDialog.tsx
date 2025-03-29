import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { AlertCircle, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useRiskScalesManager } from '@/hooks/useRiskScalesManager';
import RiskScaleCard from '@/components/risk-analysis/RiskScaleCard';
import { RiskScaleType } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface RiskScalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

interface ScaleFormValues {
  name: string;
  description: string;
  category: 'impact' | 'likelihood';
}

const RiskScalesDialog: React.FC<RiskScalesDialogProps> = ({
  open,
  onOpenChange,
  companyId,
}) => {
  const getScaleType = (scaleTypeId: string, scaleTypes: RiskScaleType[]): RiskScaleType => {
    const foundType = scaleTypes.find(type => type.id === scaleTypeId);
    if (foundType) return foundType;
    
    return {
      id: '',
      name: 'Type inconnu',
      description: '',
      category: 'impact',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const getScaleTypeId = (scale: any): string => {
    return scale.scaleTypeId || scale.scale_type_id || '';
  };

  const [activeTab, setActiveTab] = useState('likelihood');
  const [newScaleDialogOpen, setNewScaleDialogOpen] = useState(false);
  const [newScaleType, setNewScaleType] = useState<RiskScaleType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scaleToDelete, setScaleToDelete] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { toast } = useToast();
  
  const {
    riskScaleTypes,
    companyRiskScales,
    isLoading,
    isRefreshing,
    error,
    addCustomScale,
    updateScaleType,
    toggleActive,
    updateLevel,
    deleteScale,
    refreshData,
    ensureDefaultScalesExist
  } = useRiskScalesManager(companyId);

  useEffect(() => {
    if (open) {
      console.log("RiskScalesDialog: companyId =", companyId);
      console.log("RiskScalesDialog: companyRiskScales =", companyRiskScales);
      console.log("RiskScalesDialog: riskScaleTypes =", riskScaleTypes);
      console.log("RiskScalesDialog: isLoading =", isLoading);
    }
  }, [open, companyId, companyRiskScales, riskScaleTypes, isLoading]);

  const likelihoodScales = companyRiskScales.filter(
    (scale) => {
      const scaleType = getScaleType(getScaleTypeId(scale), riskScaleTypes);
      return scaleType.category === 'likelihood';
    }
  );
  
  const impactScales = companyRiskScales.filter(
    (scale) => {
      const scaleType = getScaleType(getScaleTypeId(scale), riskScaleTypes);
      return scaleType.category === 'impact';
    }
  );

  useEffect(() => {
    let mounted = true;
    
    if (open && !isLoading && !isRefreshing && !initialLoadComplete) {
      setIsInitializing(true);
      
      console.log("RiskScalesDialog: Initializing default scales for company:", companyId);
      
      ensureDefaultScalesExist()
        .then(() => {
          if (mounted) {
            return refreshData();
          }
        })
        .catch(err => {
          if (mounted) {
            console.error("Erreur lors de l'initialisation des échelles:", err);
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible d'initialiser les échelles de risque",
            });
          }
        })
        .finally(() => {
          if (mounted) {
            setIsInitializing(false);
            setInitialLoadComplete(true);
          }
        });
    }
    
    return () => {
      mounted = false;
    };
  }, [open, isLoading, isRefreshing, companyId, ensureDefaultScalesExist, refreshData, toast, initialLoadComplete]);

  const form = useForm<ScaleFormValues>({
    defaultValues: {
      name: '',
      description: '',
      category: 'impact'
    }
  });

  const handleAddCustomScale = async () => {
    const category = activeTab as 'impact' | 'likelihood';
    
    if (category === 'likelihood' && likelihoodScales.length > 0) {
      toast({
        variant: "destructive",
        title: "Échelle de probabilité unique",
        description: "Une seule échelle de probabilité est autorisée par entreprise."
      });
      return;
    }

    const newType = await addCustomScale(category);
    if (newType) {
      setNewScaleType(newType);
      form.setValue('name', newType.name);
      form.setValue('description', newType.description || '');
      form.setValue('category', category);
      setEditSheetOpen(true);
    }
  };

  const onSubmitScaleForm = async (values: ScaleFormValues) => {
    if (newScaleType) {
      setIsFormSubmitting(true);
      try {
        await updateScaleType(newScaleType.id, values.name, values.description);
        setEditSheetOpen(false);
        setNewScaleType(null);
        form.reset();
        await refreshData();
      } catch (error) {
        console.error("Error updating scale type:", error);
      } finally {
        setIsFormSubmitting(false);
      }
    }
  };

  const confirmDelete = async () => {
    if (!scaleToDelete) return;
    
    setIsDeleting(true);
    try {
      console.log("Tentative de suppression de l'échelle:", scaleToDelete);
      const success = await deleteScale(scaleToDelete);
      console.log("Résultat de la suppression:", success);
      
      if (success) {
        toast({
          title: "Échelle supprimée",
          description: "L'échelle de risque a été supprimée avec succès",
        });
        setScaleToDelete(null);
        setDeleteDialogOpen(false);
        await refreshData();
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Échec de la suppression de l'échelle",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'échelle:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteScale = (scaleId: string) => {
    console.log("Ouverture de la boîte de dialogue de suppression pour l'échelle:", scaleId);
    setScaleToDelete(scaleId);
    setDeleteDialogOpen(true);
  };

  const getLevelsForScale = (scaleId: string) => {
    const scale = companyRiskScales.find(s => s.id === scaleId);
    return scale?.levels || [];
  };

  const isContentReady = !isLoading && !isInitializing && initialLoadComplete;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Échelles de risque</DialogTitle>
          <DialogDescription>
            Configurez les échelles de risque utilisées pour évaluer les scénarios
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(!isContentReady) ? (
          <div className="flex-1 flex flex-col space-y-4 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-10" />
            </div>
            <Skeleton className="h-10 w-60" />
            <div className="flex-1 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="likelihood">Échelle de probabilité</TabsTrigger>
              <TabsTrigger value="impact">Échelles d'impact</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 my-4">
              <Button 
                onClick={handleAddCustomScale} 
                disabled={isLoading || (activeTab === 'likelihood' && likelihoodScales.length > 0)}
                className="flex-grow"
              >
                <Plus className="h-4 w-4 mr-1" />
                {activeTab === 'likelihood' 
                  ? "Échelle de probabilité" 
                  : "Ajouter une échelle d'impact"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsInitializing(true);
                  console.log("Initializing default scales for company:", companyId);
                  ensureDefaultScalesExist()
                    .then(() => refreshData())
                    .finally(() => setIsInitializing(false));
                }} 
                disabled={isLoading || isInitializing}
                title="Réinitialiser les échelles par défaut"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="likelihood" className="flex-1 mt-4">
              <ScrollArea className="h-[calc(80vh-220px)]">
                <div className="pr-4 space-y-4">
                  {likelihoodScales.length === 0 && !isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Aucune échelle de probabilité</AlertTitle>
                        <AlertDescription>
                          Veuillez créer une échelle de probabilité pour votre entreprise.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    likelihoodScales.map((scale) => (
                      <div key={scale.id} className="relative">
                        <RiskScaleCard
                          companyScale={scale}
                          scaleType={getScaleType(getScaleTypeId(scale), riskScaleTypes)}
                          levels={getLevelsForScale(scale.id)}
                          isLoading={isLoading}
                          onToggleActive={toggleActive}
                          onUpdateLevel={updateLevel}
                        />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="impact" className="flex-1 mt-4">
              <ScrollArea className="h-[calc(80vh-220px)]">
                <div className="pr-4 space-y-4">
                  {impactScales.length === 0 && !isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Aucune échelle d'impact</AlertTitle>
                        <AlertDescription>
                          Utilisez le bouton ci-dessus pour ajouter des échelles d'impact ou réinitialiser les échelles par défaut.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    impactScales.map((scale) => (
                      <div key={scale.id} className="relative">
                        <RiskScaleCard
                          companyScale={scale}
                          scaleType={getScaleType(getScaleTypeId(scale), riskScaleTypes)}
                          levels={getLevelsForScale(scale.id)}
                          isLoading={isLoading}
                          onToggleActive={toggleActive}
                          onUpdateLevel={updateLevel}
                        />
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="absolute top-3 right-3 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScale(scale.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskScalesDialog;
