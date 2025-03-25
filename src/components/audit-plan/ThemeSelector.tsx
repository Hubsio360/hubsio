
import React from 'react';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemeSelectorProps {
  auditId: string;
  selectedTopicIds: string[];
  onSelectionChange: (topicIds: string[]) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  auditId,
  selectedTopicIds,
  onSelectionChange
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
        />
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
