
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload } from 'lucide-react';
import { exampleFramework } from '../utils/exampleData';

interface ImportFrameworkSheetProps {
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

export const ImportFrameworkSheet = ({ sessionStatus }: ImportFrameworkSheetProps) => {
  const { importFramework } = useData();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

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
          
          // Vérification du format de base
          if (!frameworkData.name || !frameworkData.version || !Array.isArray(frameworkData.controls)) {
            toast({
              title: "Format invalide",
              description: "Le fichier ne contient pas les données attendues (name, version, controls)",
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          // Vérification des contrôles
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
          
          // Vérification des exigences si présentes
          if (frameworkData.requirements && Array.isArray(frameworkData.requirements)) {
            const invalidRequirements = frameworkData.requirements.filter(
              req => !req.referenceCode || !req.title
            );
            
            if (invalidRequirements.length > 0) {
              toast({
                title: "Exigences invalides",
                description: `${invalidRequirements.length} exigence(s) ne contiennent pas toutes les propriétés requises (referenceCode, title)`,
                variant: "destructive",
              });
              setIsImporting(false);
              return;
            }
          }
          
          console.log("Importing framework:", frameworkData);
          
          try {
            const result = await importFramework(frameworkData);
            console.log("Import successful:", result);
            
            // Construction du message de succès
            let successMessage = `${result.framework.name} v${result.framework.version} avec ${result.controlsCount} contrôles`;
            if (result.requirementsCount && result.requirementsCount > 0) {
              successMessage += ` et ${result.requirementsCount} exigences`;
            }
            
            toast({
              title: "Framework importé",
              description: successMessage,
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

  return (
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
            Téléchargez un fichier JSON contenant un référentiel d'audit avec ses contrôles et exigences.
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
  );
};
