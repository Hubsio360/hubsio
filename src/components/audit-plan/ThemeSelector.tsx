
import React, { useEffect, useState } from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { fetchThemesByFrameworkId } = useData();
  const [frameworkThemes, setFrameworkThemes] = useState<{id: string, name: string, description: string}[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    const loadThemes = async () => {
      if (!frameworkId) {
        console.log("Pas de frameworkId fourni, impossible de charger les thématiques");
        setFrameworkThemes([]);
        setLoadingThemes(false);
        return;
      }
      
      setLoadingThemes(true);
      setError(null);
      
      try {
        console.log(`Tentative ${attemptCount + 1}: Chargement des thématiques pour le framework:`, frameworkId);
        const themes = await fetchThemesByFrameworkId(frameworkId);
        console.log("Themes chargés:", themes);
        
        if (themes && Array.isArray(themes)) {
          setFrameworkThemes(themes);
          
          if (themes.length === 0) {
            setError("Aucune thématique n'a été trouvée. Veuillez contacter l'administrateur.");
          }
        } else {
          console.error("Format de données inattendu pour les thématiques", themes);
          setError("Format de données incorrect pour les thématiques");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des thématiques pour le framework:", error);
        setError("Impossible de charger les thématiques. Veuillez réessayer.");
      } finally {
        setLoadingThemes(false);
      }
    };

    loadThemes();
  }, [frameworkId, fetchThemesByFrameworkId, attemptCount]);

  const handleRetry = () => {
    setAttemptCount(prev => prev + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thématiques d'interview</CardTitle>
        <CardDescription>
          Sélectionnez les thématiques à inclure dans votre plan d'audit
        </CardDescription>
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
            <button 
              onClick={handleRetry}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Réessayer
            </button>
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
