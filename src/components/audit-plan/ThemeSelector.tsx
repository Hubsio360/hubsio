
import React, { useEffect, useState } from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AuditTheme } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
  const { fetchThemes, themes: allThemes, loading: globalLoading, addTheme, fetchThemesByFrameworkId } = useData();
  const [frameworkThemes, setFrameworkThemes] = useState<AuditTheme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Load themes - first try framework specific themes if frameworkId provided, otherwise use all themes
  const loadThemes = async () => {
    if (!auditId) {
      console.log("No audit ID provided for theme loading");
      return;
    }
    
    setLoadingThemes(true);
    setError(null);
    
    try {
      console.log(`Attempt ${attemptCount + 1}: Loading themes...`);
      
      let themes: AuditTheme[] = [];
      
      // Si un frameworkId est fourni, essayons d'abord de charger les thèmes spécifiques
      if (frameworkId) {
        console.log(`Loading themes for framework ${frameworkId}`);
        themes = await fetchThemesByFrameworkId(frameworkId);
        console.log("Framework specific themes loaded:", themes);
      }
      
      // Si nous n'avons pas de thèmes spécifiques au framework ou qu'ils sont vides, utilisons tous les thèmes
      if (!themes || themes.length === 0) {
        console.log("No framework specific themes found, loading all themes");
        themes = await fetchThemes();
        console.log("All themes loaded:", themes);
      }
      
      // Vérifions si nous avons des thèmes
      if (themes && Array.isArray(themes) && themes.length > 0) {
        // Filter out excluded theme names
        const filteredThemes = themes.filter(theme => 
          !excludedThemeNames.includes(theme.name)
        );
        
        console.log("Filtered themes:", filteredThemes);
        setFrameworkThemes(filteredThemes);
      } else {
        console.error("No themes found or returned");
        // Si nous n'avons toujours pas de thèmes, vérifions directement dans la base de données
        const { data, error } = await supabase
          .from('audit_themes')
          .select('*')
          .order('name');
          
        if (error) {
          console.error("Error checking themes directly:", error);
          setError("Aucune thématique trouvée. Veuillez ajouter des thématiques ou réessayer.");
        } else if (data && data.length > 0) {
          console.log("Found themes directly from database:", data);
          const directThemes = data.map(theme => ({
            id: theme.id,
            name: theme.name,
            description: theme.description || ''
          }));
          
          const filteredThemes = directThemes.filter(theme => 
            !excludedThemeNames.includes(theme.name)
          );
          
          setFrameworkThemes(filteredThemes);
        } else {
          setError("Aucune thématique trouvée. Veuillez ajouter des thématiques ou réessayer.");
        }
      }
    } catch (error) {
      console.error("Complete error while loading themes:", error);
      setError("Impossible de charger les thématiques. Veuillez réessayer.");
    } finally {
      setLoadingThemes(false);
    }
  };

  // Initial theme loading
  useEffect(() => {
    loadThemes();
  }, [auditId, frameworkId, fetchThemes, fetchThemesByFrameworkId, attemptCount]);

  // Automatic retry mechanism on failure
  useEffect(() => {
    // If error and less than 3 automatic attempts
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Automatic retry ${retryCount + 1}/3...`);
        setRetryCount(prev => prev + 1);
        setAttemptCount(prev => prev + 1);
      }, 1500); // Increase delay between attempts
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  // Manual retry function
  const handleRetry = () => {
    setAttemptCount(prev => prev + 1);
    setRetryCount(0); // Reset automatic retry counter
  };

  // Function to add a new theme
  const handleAddTheme = async () => {
    const themeName = prompt("Nom de la nouvelle thématique:");
    if (!themeName || themeName.trim() === '') return;
    
    const description = prompt("Description (optionnel):");
    
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
        
        // Reload themes
        handleRetry();
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter la thématique.",
        });
      }
    } catch (error) {
      console.error("Error adding theme:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la thématique.",
      });
    }
  };

  // Debug theme loading state
  useEffect(() => {
    console.log("Theme loading state:", {
      loadingThemes,
      globalLoading,
      frameworkThemes: frameworkThemes.length,
      allThemes: allThemes.length,
      error
    });
  }, [loadingThemes, globalLoading, frameworkThemes, allThemes, error]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Thématiques d'entretien</CardTitle>
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
        {loadingThemes || globalLoading ? (
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
