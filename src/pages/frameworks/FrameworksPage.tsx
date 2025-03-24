
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, RefreshCcw, Loader2, Download, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FrameworksList } from './components/FrameworksList';
import { ImportFrameworkSheet } from './components/ImportFrameworkSheet';
import { NoFrameworksCard } from './components/NoFrameworksCard';
import { EditFrameworkDialog } from './components/EditFrameworkDialog';
import { DeleteFrameworkDialog } from './components/DeleteFrameworkDialog';
import { EditControlDialog } from './components/EditControlDialog';
import { AddControlDialog } from './components/AddControlDialog';
import { Framework, FrameworkControl } from '@/types';
import { exampleFramework } from './utils/exampleData';

const FrameworksPage = () => {
  const { frameworks, refreshFrameworks, loading } = useData();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  
  // Dialog state
  const [frameworkToEdit, setFrameworkToEdit] = useState<Framework | null>(null);
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null);
  const [controlToEdit, setControlToEdit] = useState<FrameworkControl | null>(null);
  const [frameworkForNewControl, setFrameworkForNewControl] = useState<Framework | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEditControlDialog, setOpenEditControlDialog] = useState(false);
  const [openAddControlDialog, setOpenAddControlDialog] = useState(false);

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

  const handleExampleDownload = () => {
    const dataStr = JSON.stringify(exampleFramework, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'exemple-framework-iso27001.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleEditFramework = (framework: Framework) => {
    setFrameworkToEdit(framework);
    setOpenEditDialog(true);
  };
  
  const handleDeleteFramework = (framework: Framework) => {
    setFrameworkToDelete(framework);
    setOpenDeleteDialog(true);
  };

  const handleEditControl = (control: FrameworkControl) => {
    setControlToEdit(control);
    setOpenEditControlDialog(true);
  };

  const handleAddControl = (framework: Framework) => {
    setFrameworkForNewControl(framework);
    setOpenAddControlDialog(true);
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
          
          <ImportFrameworkSheet sessionStatus={sessionStatus} />
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
          {frameworks.length > 0 ? (
            <FrameworksList 
              onEditFramework={handleEditFramework}
              onDeleteFramework={handleDeleteFramework}
              onEditControl={handleEditControl}
              onAddControl={handleAddControl}
              sessionStatus={sessionStatus}
            />
          ) : (
            <NoFrameworksCard sessionStatus={sessionStatus} />
          )}
        </>
      )}

      {/* Dialogs */}
      <EditFrameworkDialog 
        open={openEditDialog} 
        onOpenChange={setOpenEditDialog} 
        framework={frameworkToEdit} 
      />
      
      <DeleteFrameworkDialog 
        open={openDeleteDialog} 
        onOpenChange={setOpenDeleteDialog} 
        framework={frameworkToDelete} 
      />
      
      <EditControlDialog 
        open={openEditControlDialog} 
        onOpenChange={setOpenEditControlDialog} 
        control={controlToEdit} 
      />
      
      <AddControlDialog 
        open={openAddControlDialog} 
        onOpenChange={setOpenAddControlDialog} 
        framework={frameworkForNewControl} 
      />
    </div>
  );
};

export default FrameworksPage;
