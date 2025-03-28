import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AuditTheme } from '@/types';
import { useData } from '@/contexts/DataContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

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
  const { themes, fetchThemes, fetchInterviewsByAuditId } = useData();
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
        const themeData = await fetchThemes();
        console.log("TopicsList - Themes loaded:", themeData);
        
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
        setError("Could not load themes");
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, [fetchThemes, auditId, excludedThemeNames, loading, initialLoadComplete, onSelectionChange]);

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
        <p>Loading themes...</p>
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
        <h3 className="text-lg font-medium mb-2">No themes available</h3>
        <p className="text-sm text-muted-foreground">
          {frameworkId 
            ? "No themes are associated with this framework. Contact the administrator to add some."
            : "No audit themes are available. Contact the administrator to add some."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Select audit themes to include</Label>
      <p className="text-sm text-muted-foreground mb-4">
        Associated topics and controls will be automatically created according to ISO 27001 standard.
        Opening and closing meetings are automatically included.
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
                  {selectedThemes.includes(theme.id) ? "Included" : "Excluded"}
                </Badge>
                {isExisting && (
                  <Badge variant="secondary" className="ml-2">
                    Existing
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {selectedThemes.length > 0 
            ? `${selectedThemes.length} theme(s) included out of ${themesToUse.length}`
            : "Warning: no themes selected. The audit plan will be empty."}
        </p>
      </div>
    </div>
  );
};

export default TopicsList;
