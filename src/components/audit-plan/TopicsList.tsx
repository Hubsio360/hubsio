
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AuditTopic } from '@/types';

interface TopicsListProps {
  topics: AuditTopic[];
}

const TopicsList: React.FC<TopicsListProps> = ({ topics }) => {
  if (topics.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md">
        <h3 className="text-lg font-medium mb-2">Aucune thématique disponible</h3>
        <p className="text-sm text-muted-foreground">
          Vous devez créer des thématiques d'audit avant de pouvoir générer un plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Thématiques d'audit disponibles</Label>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {topics.map((topic) => (
            <div 
              key={topic.id} 
              className="flex items-center p-2 border rounded-md"
            >
              <div className="flex-1">
                <div className="font-medium">{topic.name}</div>
                {topic.description && (
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {topic.description}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="ml-2">
                Inclus
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Toutes les thématiques seront incluses dans le plan d'audit généré.
        </p>
      </div>
    </div>
  );
};

export default TopicsList;
