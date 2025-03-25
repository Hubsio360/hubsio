
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AuditTheme, AuditTopic } from '@/types';
import { useData } from '@/contexts/DataContext';

interface TopicsListProps {
  auditId?: string;
  frameworkId?: string;
  onSelectionChange?: (selectedThemes: string[]) => void;
  excludedThemeNames?: string[]; // Thèmes à exclure (ADMIN, Cloture)
  frameworkThemes?: {id: string, name: string, description: string}[];
  loadingThemes?: boolean;
}

const TopicsList: React.FC<TopicsListProps> = ({ 
  onSelectionChange, 
  auditId,
  frameworkId,
  excludedThemeNames = ['ADMIN', 'Cloture'],
  frameworkThemes,
  loadingThemes = false
}) => {
  const { themes, fetchThemes, fetchInterviewsByAuditId } = useData();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableThemes, setAvailableThemes] = useState<AuditTheme[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [existingThemes, setExistingThemes] = useState<Set<string>>(new Set());

  // Determine which themes to use - framework specific or all themes
  const themesToUse = frameworkThemes && frameworkThemes.length > 0 
    ? frameworkThemes 
    : availableThemes;

  useEffect(() => {
    const loadThemes = async () => {
      if (loading || initialLoadComplete) return; // Éviter les appels multiples
      
      setLoading(true);
      try {
        const themeData = await fetchThemes();
        
        // Filtrer les thèmes exclus (ADMIN, Cloture)
        const filteredThemes = themeData.filter(theme => 
          !excludedThemeNames.includes(theme.name)
        );
        
        setAvailableThemes(filteredThemes);
        
        // Par défaut, toutes les thématiques non-exclues sont sélectionnées
        const themeIds = filteredThemes.map(theme => theme.id);
        setSelectedThemes(themeIds);
        
        // Si un auditId est fourni, vérifier quelles thématiques sont déjà utilisées
        if (auditId) {
          try {
            const interviews = await fetchInterviewsByAuditId(auditId);
            const usedThemes = new Set<string>();
            interviews.forEach(interview => {
              if (interview.themeId) {
                usedThemes.add(interview.themeId);
              }
            });
            setExistingThemes(usedThemes);
          } catch (error) {
            console.error("Erreur lors du chargement des interviews:", error);
          }
        }
        
        // Notifier le parent du changement initial
        if (onSelectionChange) {
          onSelectionChange(themeIds);
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Erreur lors du chargement des thématiques:", error);
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, [fetchThemes, fetchInterviewsByAuditId, auditId, excludedThemeNames]);

  // Update selections when frameworkThemes changes
  useEffect(() => {
    if (frameworkThemes && frameworkThemes.length > 0 && initialLoadComplete) {
      const themeIds = frameworkThemes.map(theme => theme.id);
      setSelectedThemes(themeIds);
      
      // Notify parent of the change
      if (onSelectionChange) {
        onSelectionChange(themeIds);
      }
    }
  }, [frameworkThemes, initialLoadComplete, onSelectionChange]);

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

  if (loading || loadingThemes) {
    return (
      <div className="flex justify-center items-center py-6 border rounded-md">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
        <p>Chargement des thématiques...</p>
      </div>
    );
  }

  if (themesToUse.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md">
        <h3 className="text-lg font-medium mb-2">Aucune thématique disponible</h3>
        <p className="text-sm text-muted-foreground">
          {frameworkId 
            ? "Aucune thématique n'est associée à ce référentiel. Contactez l'administrateur pour en ajouter."
            : "Aucune thématique d'audit n'est disponible. Contactez l'administrateur pour en ajouter."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Sélectionnez les thématiques d'audit à inclure</Label>
      <p className="text-sm text-muted-foreground mb-4">
        Les topics et contrôles associés seront automatiquement créés selon la norme ISO 27001.
        Les réunions d'ouverture et de clôture sont automatiquement incluses.
      </p>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {themesToUse.map((theme) => {
            const isExisting = existingThemes.has(theme.id);
            return (
              <div 
                key={theme.id} 
                className={`flex items-center p-3 border rounded-md ${isExisting ? 'bg-muted/30' : 'hover:bg-muted/50'} cursor-pointer`}
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
                {isExisting && (
                  <Badge variant="secondary" className="ml-2">
                    Existant
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {selectedThemes.length > 0 
            ? `${selectedThemes.length} thématique(s) incluse(s) sur ${themesToUse.length}`
            : "Attention : aucune thématique sélectionnée. Le plan d'audit sera vide."}
        </p>
      </div>
    </div>
  );
};

export default TopicsList;
