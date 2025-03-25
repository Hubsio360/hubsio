
import React from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemeSelectorProps {
  auditId: string;
  selectedTopicIds: string[];
  onSelectionChange: (topicIds: string[]) => void;
  excludedThemeNames?: string[]; // Thèmes à exclure (ADMIN, Cloture)
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  auditId,
  selectedTopicIds,
  onSelectionChange,
  excludedThemeNames = ['ADMIN', 'Cloture']
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thématiques à auditer</CardTitle>
        <CardDescription>
          Sélectionnez les thématiques à inclure dans votre plan d'audit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TopicsList 
          auditId={auditId} 
          onSelectionChange={onSelectionChange}
          excludedThemeNames={excludedThemeNames}
        />
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
