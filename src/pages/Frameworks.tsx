import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Plus, Upload, FileText, Info, Edit, Trash2, AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import { FrameworkControl, Framework } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const Frameworks = () => {
  const { frameworks, controls, importFramework, updateFramework, deleteFramework, updateControl, addControl, loading, refreshFrameworks } = useData();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [frameworkToEdit, setFrameworkToEdit] = useState<Framework | null>(null);
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null);
  const [controlToEdit, setControlToEdit] = useState<FrameworkControl | null>(null);
  const [frameworkForNewControl, setFrameworkForNewControl] = useState<Framework | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', version: '' });
  const [editControlFormData, setEditControlFormData] = useState({ 
    referenceCode: '', 
    title: '', 
    description: '' 
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingControl, setIsEditingControl] = useState(false);
  const [isAddingControl, setIsAddingControl] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEditControlDialog, setOpenEditControlDialog] = useState(false);
  const [openAddControlDialog, setOpenAddControlDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionStatus(data.session ? 'authenticated' : 'unauthenticated');
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionStatus(session ? 'authenticated' : 'unauthenticated');
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (sessionStatus !== 'authenticated') {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour importer un référentiel",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      if (!file.name.endsWith('.json')) {
        toast({
          title: "Format non supporté",
          description: "Veuillez importer un fichier JSON",
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let frameworkData;
          
          try {
            frameworkData = JSON.parse(content);
          } catch (parseError) {
            console.error("Erreur lors du parsing JSON:", parseError);
            toast({
              title: "Erreur de format",
              description: "Le fichier n'est pas un JSON valide",
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }
          
          if (!frameworkData.name || !frameworkData.version || !Array.isArray(frameworkData.controls)) {
            toast({
              title: "Format invalide",
              description: "Le fichier ne contient pas les données attendues (name, version, controls)",
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          const invalidControls = frameworkData.controls.filter(
            control => !control.referenceCode || !control.title
          );
          
          if (invalidControls.length > 0) {
            toast({
              title: "Contrôles invalides",
              description: `${invalidControls.length} contrôle(s) ne contiennent pas toutes les propriétés requises (referenceCode, title)`,
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }
          
          console.log("Importing framework:", frameworkData);
          
          try {
            const result = await importFramework(frameworkData);
            console.log("Import successful:", result);
            
            toast({
              title: "Framework importé",
              description: `${result.framework.name} v${result.framework.version} avec ${result.controlsCount} contrôles`,
            });
          } catch (importError: any) {
            console.error("Erreur lors de l'importation:", importError);
            toast({
              title: "Erreur d'importation",
              description: importError.message || "Une erreur est survenue lors de l'importation",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Erreur lors du traitement:", error);
          toast({
            title: "Erreur inattendue",
            description: "Une erreur inattendue est survenue",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier",
          variant: "destructive",
        });
        setIsImporting(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'importation",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFrameworks();
      toast({
        title: "Données actualisées",
        description: "Les référentiels et contrôles ont été actualisés",
      });
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const exampleFramework = {
    name: "ISO 27001",
    version: "2022",
    controls: [
      {
        referenceCode: "A.5.1",
        title: "Politiques de sécurité de l'information",
        description: "Fournir des directives et un soutien à la gestion de la sécurité de l'information conformément aux exigences de l'entreprise."
      },
      {
        referenceCode: "A.5.2",
        title: "Revue des politiques de sécurité de l'information",
        description: "Les politiques de sécurité de l'information doivent être revues à intervalles planifiés."
      }
    ]
  };

  const handleExampleDownload = () => {
    const dataStr = JSON.stringify(exampleFramework, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'exemple-framework-iso27001.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getControlsCountByFramework = (frameworkId: string) => {
    return controls.filter(control => control.frameworkId === frameworkId).length;
  };

  const handleEditFramework = (framework: Framework) => {
    setFrameworkToEdit(framework);
    setEditFormData({
      name: framework.name,
      version: framework.version
    });
    setOpenEditDialog(true);
  };
  
  const handleDeleteFramework = (framework: Framework) => {
    setFrameworkToDelete(framework);
    setOpenDeleteDialog(true);
  };

  const handleEditControl = (control: FrameworkControl) => {
    console.log("Editing control:", control);
    setControlToEdit(control);
    setEditControlFormData({
      referenceCode: control.referenceCode,
      title: control.title,
      description: control.description || '',
    });
    setOpenEditControlDialog(true);
  };

  const handleAddControl = (framework: Framework) => {
    setFrameworkForNewControl(framework);
    setOpenAddControlDialog(true);
  };

  const submitEdit = async () => {
    if (!frameworkToEdit) return;
    
    if (!editFormData.name || !editFormData.version) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditing(true);
    
    try {
      const updatedFramework = await updateFramework(frameworkToEdit.id, {
        name: editFormData.name,
        version: editFormData.version
      });
      
      toast({
        title: "Référentiel mis à jour",
        description: `${updatedFramework.name} v${updatedFramework.version} a été mis à jour avec succès`,
      });
      
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const submitEditControl = async () => {
    if (!controlToEdit) return;
    
    if (!editControlFormData.referenceCode || !editControlFormData.title) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditingControl(true);
    
    try {
      const updatedControl = await updateControl(controlToEdit.id, {
        referenceCode: editControlFormData.referenceCode,
        title: editControlFormData.title,
        description: editControlFormData.description
      });
      
      toast({
        title: "Contrôle mis à jour",
        description: `${updatedControl.referenceCode} - ${updatedControl.title} a été mis à jour avec succès`,
      });
      
      setOpenEditControlDialog(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contrôle:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du contrôle",
        variant: "destructive",
      });
    } finally {
      setIsEditingControl(false);
    }
  };

  const submitAddControl = async () => {
    if (!frameworkForNewControl) return;
    
    if (!editControlFormData.referenceCode || !editControlFormData.title) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingControl(true);
    
    try {
      const newControl = await addControl({
        frameworkId: frameworkForNewControl.id,
        referenceCode: editControlFormData.referenceCode,
        title: editControlFormData.title,
        description: editControlFormData.description
      });
      
      toast({
        title: "Contrôle ajouté",
        description: `${newControl.referenceCode} - ${newControl.title} a été ajouté avec succès`,
      });
      
      setOpenAddControlDialog(false);
      setEditControlFormData({
        referenceCode: '',
        title: '',
        description: ''
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du contrôle:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du contrôle",
        variant: "destructive",
      });
    } finally {
      setIsAddingControl(false);
    }
  };

  const submitDelete = async () => {
    if (!frameworkToDelete) {
      console.error("Tentative de suppression sans framework sélectionné");
      return;
    }
    
    console.log("Début de la suppression du framework:", frameworkToDelete);
    setIsDeleting(true);
    
    try {
      await deleteFramework(frameworkToDelete.id);
      
      console.log("Framework supprimé avec succès:", frameworkToDelete.id);
      
      const updatedFrameworks = frameworks.filter(f => f.id !== frameworkToDelete.id);
      
      toast({
        title: "Référentiel supprimé",
        description: `${frameworkToDelete.name} a été supprimé avec succès`,
      });
      
      setOpenDeleteDialog(false);
      setFrameworkToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Référentiels</h1>
          <p className="text-muted-foreground">
            Gérez les référentiels d'audit et leurs contrôles
          </p>
        </div>

        <div className="flex gap-3">
          {sessionStatus === 'unauthenticated' && (
            <Alert className="mb-2 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertTitle>Authentification requise</AlertTitle>
              <AlertDescription>
                Vous devez être connecté pour pouvoir importer ou modifier des référentiels.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span>Actualiser</span>
          </Button>
          
          <Button variant="outline" onClick={handleExampleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Exemple JSON</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button disabled={sessionStatus !== 'authenticated'}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Importer un référentiel</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Importer un référentiel</SheetTitle>
                <SheetDescription>
                  Téléchargez un fichier JSON contenant un référentiel d'audit et ses contrôles.
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Format requis</CardTitle>
                    <CardDescription>
                      Le fichier doit être au format JSON et contenir les champs suivants :
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                      {JSON.stringify(exampleFramework, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="framework-file">Fichier JSON</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-md p-10 bg-muted/50">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Glissez-déposez ou cliquez pour sélectionner
                    </p>
                    <Input
                      id="framework-file"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleFileImport}
                      disabled={isImporting || sessionStatus !== 'authenticated'}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const inputElement = document.getElementById('framework-file') as HTMLInputElement;
                        if (inputElement) inputElement.click();
                      }}
                      disabled={isImporting || sessionStatus !== 'authenticated'}
                    >
                      {isImporting ? 'Importation...' : 'Sélectionner un fichier'}
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Format d'importation</AlertTitle>
        <AlertDescription>
          Pour importer un référentiel, utilisez un fichier JSON avec le format suivant :
          <pre className="mt-2 p-2 bg-blue-100 rounded text-xs overflow-auto">
{`{
  "name": "Nom du référentiel",
  "version": "Version",
  "controls": [
    {
      "referenceCode": "A.1",
      "title": "Titre du contrôle",
      "description": "Description du contrôle (optionnelle)"
    }
  ]
}`}
          </pre>
          <span className="block mt-2">Vous pouvez télécharger un exemple en cliquant sur "Exemple JSON"</span>
        </AlertDescription>
      </Alert>

      {loading.frameworks ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement des référentiels...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((framework) => (
              <Card key={framework.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{framework.name}</CardTitle>
                      <CardDescription>Version {framework.version}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditFramework(framework)}
                        className="h-8 w-8"
                        disabled={sessionStatus !== 'authenticated'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteFramework(framework)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={sessionStatus !== 'authenticated'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{getControlsCountByFramework(framework.id)} contrôles</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddControl(framework)}
                      className="h-7 px-2"
                      disabled={sessionStatus !== 'authenticated'}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Ajouter</span>
                    </Button>
                  </div>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        Voir les détails
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-2">
                      {controls
                        .filter(control => control.frameworkId === framework.id)
                        .slice(0, 5)
                        .map(control => (
                          <ContextMenu key={control.id}>
                            <ContextMenuTrigger>
                              <div className="text-sm border p-2 rounded group relative hover:bg-accent/30 transition-colors">
                                <div className="font-medium">{control.referenceCode} - {control.title}</div>
                                <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                                  {control.description}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditControl(control);
                                  }}
                                  className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={sessionStatus !== 'authenticated'}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem 
                                onClick={() => handleEditControl(control)}
                                className="flex items-center gap-2"
                                disabled={sessionStatus !== 'authenticated'}
                              >
                                <Edit className="h-4 w-4" />
                                <span>Modifier ce contrôle</span>
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      {getControlsCountByFramework(framework.id) > 5 && (
                        <div className="text-center text-sm text-muted-foreground mt-2">
                          + {getControlsCountByFramework(framework.id) - 5} autres contrôles
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>

          {frameworks.length === 0 && (
            <Card className="mt-6">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun référentiel</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Importez un référentiel pour commencer à créer des audits.
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button disabled={sessionStatus !== 'authenticated'}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Importer un référentiel</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Importer un référentiel</SheetTitle>
                      <SheetDescription>
                        Téléchargez un fichier JSON contenant un référentiel d'audit et ses contrôles.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="py-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle>Format requis</CardTitle>
                          <CardDescription>
                            Le fichier doit être au format JSON et contenir les champs suivants :
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                            {JSON.stringify(exampleFramework, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="framework-file-alt">Fichier JSON</Label>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-md p-10 bg-muted/50">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Glissez-déposez ou cliquez pour sélectionner
                          </p>
                          <Input
                            id="framework-file-alt"
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleFileImport}
                            disabled={isImporting || sessionStatus !== 'authenticated'}
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const inputElement = document.getElementById('framework-file-alt') as HTMLInputElement;
                              if (inputElement) inputElement.click();
                            }}
                            disabled={isImporting || sessionStatus !== 'authenticated'}
                          >
                            {isImporting ? 'Importation...' : 'Sélectionner un fichier'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le référentiel</DialogTitle>
            <DialogDescription>
              Modifiez les informations du référentiel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={editFormData.version}
                onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={submitEdit} disabled={isEditing}>
              {isEditing ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le référentiel</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce référentiel ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Tous les contrôles associés à ce référentiel seront également supprimés.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={submitDelete} disabled={isDeleting}>
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditControlDialog} onOpenChange={setOpenEditControlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le contrôle</DialogTitle>
            <DialogDescription>
              Modifiez les informations du contrôle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-control-code">Code de référence</Label>
              <Input
                id="edit-control-code"
                value={editControlFormData.referenceCode}
                onChange={(e) => setEditControlFormData({ ...editControlFormData, referenceCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-control-title">Titre</Label>
              <Input
                id="edit-control-title"
                value={editControlFormData.title}
                onChange={(e) => setEditControlFormData({ ...editControlFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-control-description">Description</Label>
              <Textarea
                id="edit-control-description"
                value={editControlFormData.description}
                onChange={(e) => setEditControlFormData({ ...editControlFormData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditControlDialog(false)}>
              Annuler
            </Button>
            <Button onClick={submitEditControl} disabled={isEditingControl}>
              {isEditingControl ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAddControlDialog} onOpenChange={setOpenAddControlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un contrôle</DialogTitle>
            <DialogDescription>
              {frameworkForNewControl && `Ajoutez un nouveau contrôle au référentiel ${frameworkForNewControl.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-control-code">Code de référence</Label>
              <Input
                id="add-control-code"
                value={editControlFormData.referenceCode}
                onChange={(e) => setEditControlFormData({ ...editControlFormData, referenceCode: e.target.value })}
                placeholder="Ex: A.5.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-control-title">Titre</Label>
              <Input
                id="add-control-title"
                value={editControlFormData.title}
                onChange={(e) => setEditControlFormData({ ...editControlFormData, title: e.target.value })}
                placeholder="Titre du contrôle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-control-description">Description</Label>
              <Textarea
                id="add-control-description"
                value={editControlFormData.description}
                onChange={(e) => setEditControlFormData({ ...editControlFormData, description: e.target.value })}
                placeholder="Description détaillée du contrôle"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setOpenAddControlDialog(false);
                setEditControlFormData({ referenceCode: '', title: '', description: '' });
              }}
            >
              Annuler
            </Button>
            <Button onClick={submitAddControl} disabled={isAddingControl}>
              {isAddingControl ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Frameworks;
