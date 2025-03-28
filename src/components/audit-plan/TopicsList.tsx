
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AuditTheme } from '@/types';
import { useData } from '@/contexts/DataContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TopicsListProps {
  auditId?: string;
  frameworkId?: string;
  onSelectionChange?: (selectedThemes: string[]) => void;
  excludedThemeNames?: string[]; // Themes to exclude (ADMIN, Cloture)
  frameworkThemes?: AuditTheme[];
  loadingThemes?: boolean;
}

const TopicsList: React.FC<TopicsListProps> = ({ 
  onSelectionChange, 
  auditId,
  frameworkId,
  excludedThemeNames = ['ADMIN', 'Cloture'],
  frameworkThemes = [],
  loadingThemes = false
}) => {
  const { themes, fetchThemes } = useData();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableThemes, setAvailableThemes] = useState<AuditTheme[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [existingThemes, setExistingThemes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Determine which themes to use - framework specific or all themes
  const themesToUse = frameworkThemes && frameworkThemes.length > 0 
    ? frameworkThemes 
    : availableThemes.length > 0 ? availableThemes : themes;

  // Log themes data for debugging
  useEffect(() => {
    console.log("TopicsList - diagnostics:", {
      frameworkThemes: frameworkThemes?.length || 0,
      availableThemes: availableThemes.length,
      allThemes: themes.length,
      loading,
      loadingThemes,
      themesToUse: themesToUse.length,
      initialLoadComplete
    });
  }, [frameworkThemes, availableThemes, themes, loading, loadingThemes, themesToUse, initialLoadComplete]);

  useEffect(() => {
    const loadThemes = async () => {
      if (loading || initialLoadComplete) return; // Avoid multiple calls
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("TopicsList - Loading themes...");
        
        // Si nous avons déjà des thèmes passés en props, utilisons-les
        if (frameworkThemes && frameworkThemes.length > 0) {
          console.log("TopicsList - Using provided framework themes:", frameworkThemes);
          setAvailableThemes(frameworkThemes);
          
          // Par défaut, tous les thèmes non-exclus sont sélectionnés
          const themeIds = frameworkThemes
            .filter(theme => !excludedThemeNames.includes(theme.name))
            .map(theme => theme.id);
            
          setSelectedThemes(themeIds);
          
          // Notify parent of initial change
          if (onSelectionChange) {
            onSelectionChange(themeIds);
          }
          
          setInitialLoadComplete(true);
          setLoading(false);
          return;
        }
        
        // Sinon, chargeons les thèmes
        const themeData = await fetchThemes();
        console.log("TopicsList - Themes loaded:", themeData);
        
        // Si nous n'avons pas de thèmes, vérifions directement dans la base de données
        if (!themeData || themeData.length === 0) {
          console.log("TopicsList - No themes returned from fetchThemes, trying direct DB access");
          
          const { data, error } = await supabase
            .from('audit_themes')
            .select('*')
            .order('name');
            
          if (error) {
            console.error("Error loading themes directly:", error);
            setError("Impossible de charger les thématiques");
            setLoading(false);
            return;
          }
          
          if (!data || data.length === 0) {
            toast({
              variant: "destructive",
              title: "Aucune thématique trouvée",
              description: "Veuillez ajouter des thématiques pour continuer",
            });
            setError("Aucune thématique trouvée");
            setLoading(false);
            return;
          }
          
          const directThemes = data.map(theme => ({
            id: theme.id,
            name: theme.name,
            description: theme.description || ''
          }));
          
          console.log("TopicsList - Found themes directly from DB:", directThemes);
          
          // Filter excluded themes (ADMIN, Cloture)
          const filteredThemes = directThemes.filter(theme => 
            !excludedThemeNames.includes(theme.name)
          );
          
          setAvailableThemes(filteredThemes);
          console.log("TopicsList - Available themes after filtering:", filteredThemes);
          
          // By default, all non-excluded themes are selected
          const themeIds = filteredThemes.map(theme => theme.id);
          setSelectedThemes(themeIds);
          
          // Notify parent of initial change
          if (onSelectionChange) {
            onSelectionChange(themeIds);
          }
          
          setInitialLoadComplete(true);
          setLoading(false);
          return;
        }
        
        // Filter excluded themes (ADMIN, Cloture)
        const filteredThemes = themeData.filter(theme => 
          !excludedThemeNames.includes(theme.name)
        );
        
        setAvailableThemes(filteredThemes);
        console.log("TopicsList - Available themes after filtering:", filteredThemes);
        
        // By default, all non-excluded themes are selected
        const themeIds = filteredThemes.map(theme => theme.id);
        setSelectedThemes(themeIds);
        
        // If an auditId is provided, check which themes are already in use
        if (auditId) {
          try {
            const { data, error } = await supabase
              .from('audit_interviews')
              .select('theme_id')
              .eq('audit_id', auditId);
              
            if (error) {
              console.error("Error loading interviews:", error);
            } else {
              const usedThemes = new Set<string>();
              data.forEach(interview => {
                if (interview.theme_id) {
                  usedThemes.add(interview.theme_id);
                }
              });
              setExistingThemes(usedThemes);
              console.log("TopicsList - Existing themes for this audit:", usedThemes);
            }
          } catch (error) {
            console.error("Error when loading interviews:", error);
          }
        }
        
        // Notify parent of initial change
        if (onSelectionChange) {
          onSelectionChange(themeIds);
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error loading themes:", error);
        setError("Impossible de charger les thématiques");
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, [fetchThemes, auditId, excludedThemeNames, loading, initialLoadComplete, onSelectionChange, frameworkThemes]);

  // Update selections when frameworkThemes changes
  useEffect(() => {
    if (frameworkThemes && frameworkThemes.length > 0 && initialLoadComplete) {
      console.log("TopicsList - Updating selections based on frameworkThemes:", frameworkThemes);
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
      
      console.log("TopicsList - Selected themes after toggle:", newSelection);
      
      // Notify parent of the change if needed
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

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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
        Les sujets et contrôles associés seront automatiquement créés selon la norme ISO 27001.
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
            : "Attention: aucune thématique sélectionnée. Le plan d'audit sera vide."}
        </p>
      </div>
    </div>
  );
};

export default TopicsList;
