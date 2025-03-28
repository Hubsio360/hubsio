import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useRiskScalesManager } from '@/hooks/useRiskScalesManager';
import RiskScaleCard from '@/components/risk-analysis/RiskScaleCard';
import { RiskScaleType } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

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
  const [activeTab, setActiveTab] = useState('impact');
  const [newScaleDialogOpen, setNewScaleDialogOpen] = useState(false);
  const [newScaleType, setNewScaleType] = useState<RiskScaleType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scaleToDelete, setScaleToDelete] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    refreshData
  } = useRiskScalesManager(companyId);

  const form = useForm<ScaleFormValues>({
    defaultValues: {
      name: '',
      description: '',
      category: 'impact'
    }
  });

  const getScaleType = (scaleTypeId: string): RiskScaleType => {
    return riskScaleTypes.find(type => type.id === scaleTypeId) || {
      id: '',
      name: 'Type inconnu',
      description: '',
      category: 'impact'
    };
  };

  const getScaleTypeId = (scale: any): string => {
    return scale.scaleTypeId || scale.scale_type_id || '';
  };

  const impactScales = companyRiskScales.filter(
    (scale) => {
      const scaleType = getScaleType(getScaleTypeId(scale));
      return scaleType.category === 'impact';
    }
  );
  
  const likelihoodScales = companyRiskScales.filter(
    (scale) => {
      const scaleType = getScaleType(getScaleTypeId(scale));
      return scaleType.category === 'likelihood';
    }
  );

  const handleAddCustomScale = async () => {
    const category = activeTab as 'impact' | 'likelihood';
    const newType = await addCustomScale(category);
    if (newType) {
      setNewScaleType(newType);
      form.setValue('name', newType.name);
      form.setValue('description', newType.description || '');
      form.setValue('category', newType.category || category);
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
      console.log("Attempting to delete scale:", scaleToDelete);
      const success = await deleteScale(scaleToDelete);
      console.log("Delete result:", success);
      
      if (success) {
        toast({
          title: "Échelle supprimée",
          description: "L'échelle de risque a été supprimée avec succès",
        });
        setScaleToDelete(null);
        setDeleteDialogOpen(false);
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
    console.log("Opening delete dialog for scale:", scaleId);
    setScaleToDelete(scaleId);
    setDeleteDialogOpen(true);
  };

  const getLevelsForScale = (scaleId: string) => {
    const scale = companyRiskScales.find(s => s.id === scaleId);
    return scale?.levels || [];
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Échelles de risque</DialogTitle>
            <DialogDescription>
              Configurez les échelles de risque utilisées pour évaluer les scénarios de risque
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="impact">Échelles d'impact</TabsTrigger>
              <TabsTrigger value="likelihood">Échelles de probabilité</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 my-4">
              <Button onClick={handleAddCustomScale} disabled={isLoading} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une nouvelle échelle {activeTab === 'impact' ? "d'impact" : "de probabilité"}
              </Button>
            </div>

            <TabsContent value="impact" className="flex-1 mt-4">
              <ScrollArea className="h-[calc(80vh-220px)]">
                <div className="pr-4 space-y-4">
                  {impactScales.length === 0 && !isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune échelle d'impact configurée. Ajoutez-en une depuis le bouton ci-dessus.
                    </div>
                  ) : (
                    impactScales.map((scale) => (
                      <div key={scale.id} className="relative">
                        <RiskScaleCard
                          companyScale={scale}
                          scaleType={getScaleType(getScaleTypeId(scale))}
                          levels={getLevelsForScale(scale.id)}
                          isLoading={isLoading}
                          onToggleActive={toggleActive}
                          onUpdateLevel={updateLevel}
                        />
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="absolute top-3 right-3 z-10"
                          onClick={() => handleDeleteScale(scale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="likelihood" className="flex-1 mt-4">
              <ScrollArea className="h-[calc(80vh-220px)]">
                <div className="pr-4 space-y-4">
                  {likelihoodScales.length === 0 && !isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune échelle de probabilité configurée. Ajoutez-en une depuis le bouton ci-dessus.
                    </div>
                  ) : (
                    likelihoodScales.map((scale) => (
                      <div key={scale.id} className="relative">
                        <RiskScaleCard
                          companyScale={scale}
                          scaleType={getScaleType(getScaleTypeId(scale))}
                          levels={getLevelsForScale(scale.id)}
                          isLoading={isLoading}
                          onToggleActive={toggleActive}
                          onUpdateLevel={updateLevel}
                        />
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="absolute top-3 right-3 z-10"
                          onClick={() => handleDeleteScale(scale.id)}
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

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={editSheetOpen} onOpenChange={(open) => {
        if (!open && isFormSubmitting) return;
        setEditSheetOpen(open);
        if (!open) {
          setNewScaleType(null);
          form.reset();
        }
      }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Configurer votre nouvelle échelle</SheetTitle>
            <SheetDescription>
              Personnalisez le nom et la description de votre nouvelle échelle de risque.
            </SheetDescription>
          </SheetHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitScaleForm)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom de l'échelle" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Description de l'échelle"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="impact">Impact</SelectItem>
                        <SelectItem value="likelihood">Probabilité</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <SheetFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditSheetOpen(false);
                    setNewScaleType(null);
                  }}
                  disabled={isFormSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isFormSubmitting}>
                  {isFormSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${deleteDialogOpen ? '' : 'hidden'}`}>
        <div className="bg-background rounded-lg p-6 w-full max-w-md" onClick={stopPropagation}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Confirmer la suppression</h2>
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer cette échelle de risque ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setScaleToDelete(null);
                  setDeleteDialogOpen(false);
                }}
                disabled={isDeleting}
                className="mt-2 sm:mt-0"
              >
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RiskScalesDialog;
