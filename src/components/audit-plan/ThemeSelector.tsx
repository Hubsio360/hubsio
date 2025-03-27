
import React, { useEffect, useState } from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

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

  useEffect(() => {
    const loadThemes = async () => {
      if (frameworkId) {
        setLoadingThemes(true);
        try {
          const themes = await fetchThemesByFrameworkId(frameworkId);
          console.log("Loaded themes:", themes);
          setFrameworkThemes(themes);
        } catch (error) {
          console.error("Erreur lors du chargement des thématiques pour le framework:", error);
        } finally {
          setLoadingThemes(false);
        }
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
        <TopicsList 
          auditId={auditId} 
          frameworkId={frameworkId}
          onSelectionChange={onSelectionChange}
          excludedThemeNames={excludedThemeNames}
          frameworkThemes={frameworkThemes}
          loadingThemes={loadingThemes}
        />
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
