
import React, { useEffect, useState } from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadThemes = async () => {
      if (frameworkId) {
        setLoadingThemes(true);
        setError(null);
        try {
          console.log("Chargement des thématiques pour le framework:", frameworkId);
          const themes = await fetchThemesByFrameworkId(frameworkId);
          console.log("Themes chargés:", themes);
          setFrameworkThemes(themes);
          
          if (themes.length === 0) {
            setError("Aucune thématique trouvée pour ce framework");
          }
        } catch (error) {
          console.error("Erreur lors du chargement des thématiques pour le framework:", error);
          setError("Impossible de charger les thématiques");
        } finally {
          setLoadingThemes(false);
        }
      } else {
        console.log("Pas de frameworkId fourni, impossible de charger les thématiques");
        setFrameworkThemes([]);
      }
    };

    loadThemes();
  }, [frameworkId, fetchThemesByFrameworkId]);

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
          <div className="text-center p-4 text-muted-foreground border rounded-md">
            <p>{error}</p>
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
