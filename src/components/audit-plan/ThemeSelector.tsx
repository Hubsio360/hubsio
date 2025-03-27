
import React, { useEffect, useState } from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ThemeSelectorProps {
  auditId: string;
  frameworkId?: string;
  selectedTopicIds: string[];
  onSelectionChange: (topicIds: string[]) => void;
  excludedThemeNames?: string[];
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  auditId,
  frameworkId,
  selectedTopicIds,
  onSelectionChange,
  excludedThemeNames = ['ADMIN', 'Cloture']
}) => {
  const { fetchThemesByFrameworkId, addTheme } = useData();
  const [frameworkThemes, setFrameworkThemes] = useState<{id: string, name: string, description: string}[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Cette fonction tente de charger les thématiques avec un meilleur logging
  const loadThemes = async () => {
    if (!frameworkId) {
      console.log("Pas de frameworkId fourni, utilisation des thématiques générales");
    }
    
    setLoadingThemes(true);
    setError(null);
    
    try {
      console.log(`Tentative ${attemptCount + 1}: Chargement des thématiques pour le framework:`, frameworkId || 'tous');
      const themes = await fetchThemesByFrameworkId(frameworkId || '');
      console.log("Themes chargés:", themes);
      
      if (themes && Array.isArray(themes) && themes.length > 0) {
        setFrameworkThemes(themes);
        console.log("Thématiques définies dans l'état local:", themes);
      } else {
        console.error("Aucune thématique n'a été trouvée ou retournée");
        setError("Aucune thématique n'a été trouvée. Veuillez ajouter des thématiques ou réessayer.");
      }
    } catch (error) {
      console.error("Erreur complète lors du chargement des thématiques:", error);
      setError("Impossible de charger les thématiques. Veuillez réessayer.");
    } finally {
      setLoadingThemes(false);
    }
  };

  // Chargement initial des thématiques
  useEffect(() => {
    loadThemes();
  }, [frameworkId, fetchThemesByFrameworkId, attemptCount]);

  // Mécanisme de retry automatique en cas d'échec
  useEffect(() => {
    // Si erreur et moins de 3 tentatives automatiques
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retry automatique ${retryCount + 1}/3...`);
        setRetryCount(prev => prev + 1);
        setAttemptCount(prev => prev + 1);
      }, 1500); // Augmenter le délai entre les tentatives
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  // Fonction de retry manuelle
  const handleRetry = () => {
    setAttemptCount(prev => prev + 1);
    setRetryCount(0); // Réinitialiser le compteur de retry automatiques
  };

  // Fonction pour ajouter une nouvelle thématique
  const handleAddTheme = async () => {
    const themeName = prompt("Nom de la nouvelle thématique:");
    if (!themeName || themeName.trim() === '') return;
    
    const description = prompt("Description (optionnelle):");
    
    try {
      const newTheme = await addTheme({
        name: themeName.trim(),
        description: description ? description.trim() : ''
      });
      
      if (newTheme) {
        toast({
          title: "Thématique ajoutée",
          description: `La thématique "${newTheme.name}" a été ajoutée avec succès.`,
        });
        
        // Recharger les thématiques
        handleRetry();
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter la thématique.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la thématique:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la thématique.",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Thématiques d'interview</CardTitle>
          <CardDescription>
            Sélectionnez les thématiques à inclure dans votre plan d'audit
          </CardDescription>
        </div>
        <Button 
          onClick={handleAddTheme}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle thématique
        </Button>
      </CardHeader>
      <CardContent>
        {loadingThemes ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button 
                onClick={handleRetry}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button 
                onClick={handleAddTheme}
                variant="outline"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter une thématique
              </Button>
            </div>
          </div>
        ) : (
          <TopicsList 
            auditId={auditId} 
            frameworkId={frameworkId}
            onSelectionChange={onSelectionChange}
            excludedThemeNames={excludedThemeNames}
            frameworkThemes={frameworkThemes}
            loadingThemes={loadingThemes}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
