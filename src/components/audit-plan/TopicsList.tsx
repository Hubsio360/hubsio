
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AuditTheme, AuditTopic } from '@/types';
import { useData } from '@/contexts/DataContext';

interface TopicsListProps {
  topics: AuditTopic[];
  onSelectionChange?: (selectedThemes: string[]) => void;
}

const TopicsList: React.FC<TopicsListProps> = ({ topics, onSelectionChange }) => {
  const { themes, fetchThemes } = useData();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableThemes, setAvailableThemes] = useState<AuditTheme[]>([]);

  useEffect(() => {
    const loadThemes = async () => {
      setLoading(true);
      try {
        const themeData = await fetchThemes();
        setAvailableThemes(themeData);
        
        // Par défaut, toutes les thématiques sont sélectionnées
        setSelectedThemes(themeData.map(theme => theme.id));
        
        // Notifier le parent du changement initial
        if (onSelectionChange) {
          onSelectionChange(themeData.map(theme => theme.id));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des thématiques:", error);
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, [fetchThemes, onSelectionChange]);

  const handleThemeToggle = (themeId: string) => {
    setSelectedThemes(prev => {
      const newSelection = prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId];
      
      // Notifier le parent du changement si nécessaire
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6 border rounded-md">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
        <p>Chargement des thématiques...</p>
      </div>
    );
  }

  if (availableThemes.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md">
        <h3 className="text-lg font-medium mb-2">Aucune thématique disponible</h3>
        <p className="text-sm text-muted-foreground">
          Aucune thématique d'audit n'est disponible. Contactez l'administrateur pour en ajouter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Sélectionnez les thématiques d'audit à inclure</Label>
      <p className="text-sm text-muted-foreground mb-4">
        Les topics et contrôles associés seront automatiquement créés selon la norme ISO 27001
      </p>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {availableThemes.map((theme) => (
            <div 
              key={theme.id} 
              className="flex items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
              onClick={() => handleThemeToggle(theme.id)}
            >
              <Checkbox 
                id={`theme-${theme.id}`}
                checked={selectedThemes.includes(theme.id)}
                onCheckedChange={() => handleThemeToggle(theme.id)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">{theme.name}</div>
                {theme.description && (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {theme.description}
                  </div>
                )}
              </div>
              <Badge 
                variant={selectedThemes.includes(theme.id) ? "default" : "outline"} 
                className="ml-2"
              >
                {selectedThemes.includes(theme.id) ? "Inclus" : "Exclu"}
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {selectedThemes.length > 0 
            ? `${selectedThemes.length} thématique(s) incluse(s) sur ${availableThemes.length}`
            : "Attention : aucune thématique sélectionnée. Le plan d'audit sera vide."}
        </p>
      </div>
    </div>
  );
};

export default TopicsList;
