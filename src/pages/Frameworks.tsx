
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, Plus, Upload, FileText, Info, Edit, Trash2, AlertCircle } from 'lucide-react';
import { FrameworkControl, Framework } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';

const Frameworks = () => {
  const { frameworks, controls, importFramework, updateFramework, deleteFramework } = useData();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [frameworkToEdit, setFrameworkToEdit] = useState<Framework | null>(null);
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', version: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      // Vérifier le format du fichier
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
          const frameworkData = JSON.parse(content);
          
          // Validation basique du format
          if (!frameworkData.name || !frameworkData.version || !Array.isArray(frameworkData.controls)) {
            toast({
              title: "Format invalide",
              description: "Le fichier ne contient pas les données attendues (name, version, controls)",
              variant: "destructive",
            });
            return;
          }
          
          // Importer le framework
          const result = await importFramework(frameworkData);
          
          toast({
            title: "Framework importé",
            description: `${result.framework.name} v${result.framework.version} avec ${result.controlsCount} contrôles`,
          });
        } catch (error) {
          console.error("Erreur lors du parsing JSON:", error);
          toast({
            title: "Erreur de format",
            description: "Le fichier n'est pas un JSON valide",
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

  // Format exemple pour l'export
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

  const submitDelete = async () => {
    if (!frameworkToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await deleteFramework(frameworkToDelete.id);
      
      toast({
        title: "Référentiel supprimé",
        description: `${frameworkToDelete.name} a été supprimé avec succès`,
      });
      
      setOpenDeleteDialog(false);
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
          <Button variant="outline" onClick={handleExampleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Exemple JSON</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button>
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
                      disabled={isImporting}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const inputElement = document.getElementById('framework-file') as HTMLInputElement;
                        if (inputElement) inputElement.click();
                      }}
                      disabled={isImporting}
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
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteFramework(framework)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground mb-4">
                <FileText className="h-4 w-4 mr-2" />
                <span>{getControlsCountByFramework(framework.id)} contrôles</span>
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
                      <div key={control.id} className="text-sm border p-2 rounded">
                        <div className="font-medium">{control.referenceCode} - {control.title}</div>
                        <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                          {control.description}
                        </div>
                      </div>
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Importer un référentiel</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                {/* Contenu identique au sheet ci-dessus */}
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
                        disabled={isImporting}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const inputElement = document.getElementById('framework-file-alt') as HTMLInputElement;
                          if (inputElement) inputElement.click();
                        }}
                        disabled={isImporting}
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

      {/* Dialogue de suppression */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le référentiel</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce référentiel ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          {frameworkToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="font-medium">Attention</span>
              </div>
              <p className="text-muted-foreground mb-2">
                La suppression du référentiel <span className="font-medium">{frameworkToDelete.name}</span> entraînera également la suppression de :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 space-y-1">
                <li>{getControlsCountByFramework(frameworkToDelete.id)} contrôles associés</li>
              </ul>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={submitDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de modification */}
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
              <Label htmlFor="name">Nom du référentiel</Label>
              <Input
                id="name"
                placeholder="Nom"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="1.0"
                value={editFormData.version}
                onChange={(e) => setEditFormData({...editFormData, version: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={submitEdit}
              disabled={isEditing}
            >
              {isEditing ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Frameworks;
