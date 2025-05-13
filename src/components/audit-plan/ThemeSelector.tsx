
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useData } from '@/contexts/DataContext';

interface ThemeSelectorProps {
  auditId: string;
  frameworkId?: string;
  selectedThemeIds: string[];
  onSelectionChange: (themeIds: string[]) => void;
  excludedThemeNames?: string[];
}

export function ThemeSelector({
  auditId,
  frameworkId,
  selectedThemeIds,
  onSelectionChange,
  excludedThemeNames = ['ADMIN', 'Cloture']
}: ThemeSelectorProps) {
  const { themes, fetchThemes } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredThemes, setFilteredThemes] = useState(themes);
  const [loading, setLoading] = useState(false);

  // Load themes if not already loaded
  useEffect(() => {
    const loadThemes = async () => {
      if (themes.length === 0) {
        setLoading(true);
        try {
          await fetchThemes();
        } catch (error) {
          console.error('Error loading themes:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadThemes();
  }, [themes.length, fetchThemes]);

  // Filter themes based on search query and excluded names
  useEffect(() => {
    const filtered = themes.filter(theme => 
      // Filter out excluded themes
      !excludedThemeNames.includes(theme.name) && 
      // Apply search filter if there's a query
      (searchQuery === '' || 
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (theme.description && theme.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    
    setFilteredThemes(filtered);
  }, [searchQuery, themes, excludedThemeNames]);

  // Toggle theme selection
  const toggleTheme = (themeId: string) => {
    if (selectedThemeIds.includes(themeId)) {
      onSelectionChange(selectedThemeIds.filter(id => id !== themeId));
    } else {
      onSelectionChange([...selectedThemeIds, themeId]);
    }
  };

  // Select or deselect all themes
  const selectAll = (select: boolean) => {
    if (select) {
      onSelectionChange(filteredThemes.map(theme => theme.id));
    } else {
      onSelectionChange([]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        <span className="ml-3">Chargement des thématiques...</span>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <Input
            placeholder="Rechercher une thématique..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
            {selectedThemeIds.length} thèmes sélectionnés
          </Badge>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectAll(true)}
              className="h-8"
            >
              Tout sélectionner
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectAll(false)}
              className="h-8"
            >
              Tout désélectionner
            </Button>
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[200px]">
        <div className="px-4 pb-4 space-y-1">
          {filteredThemes.length > 0 ? (
            filteredThemes.map((theme) => (
              <div
                key={theme.id}
                className="flex items-start space-x-3 py-2 px-3 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => toggleTheme(theme.id)}
              >
                <Checkbox
                  checked={selectedThemeIds.includes(theme.id)}
                  onCheckedChange={() => toggleTheme(theme.id)}
                  id={`theme-${theme.id}`}
                />
                <div>
                  <label
                    htmlFor={`theme-${theme.id}`}
                    className="font-medium cursor-pointer text-sm"
                  >
                    {theme.name}
                  </label>
                  {theme.description && (
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Aucune thématique trouvée
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
