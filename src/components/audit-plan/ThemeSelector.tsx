
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { AuditTheme } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface ThemeSelectorProps {
  auditId: string;
  frameworkId: string;
  excludedThemeNames?: string[];
  onSelectionChange: (themeIds: string[]) => void;
  selectedThemeIds?: string[];
}

export function ThemeSelector({
  auditId,
  frameworkId,
  excludedThemeNames = [],
  onSelectionChange,
  selectedThemeIds = [],
}: ThemeSelectorProps) {
  const { themes, fetchThemesByFrameworkId, addTheme } = useData();
  
  const [loading, setLoading] = useState(true);
  const [filteredThemes, setFilteredThemes] = useState<AuditTheme[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedThemeIds);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New theme dialog state
  const [isNewThemeDialogOpen, setIsNewThemeDialogOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Load themes on component mount
  useEffect(() => {
    const loadThemes = async () => {
      setLoading(true);
      try {
        await fetchThemesByFrameworkId(frameworkId);
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (frameworkId) {
      loadThemes();
    }
  }, [frameworkId]);
  
  // Update filtered themes when themes or search term changes
  useEffect(() => {
    if (!themes) return;
    
    let filtered = [...themes];
    
    // Filter out excluded themes
    if (excludedThemeNames.length > 0) {
      filtered = filtered.filter((theme) => !excludedThemeNames.includes(theme.name));
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (theme) =>
          theme.name.toLowerCase().includes(searchLower) ||
          (theme.description && theme.description.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredThemes(filtered);
  }, [themes, searchTerm, excludedThemeNames]);
  
  // Handle theme selection change
  const handleThemeChange = (themeId: string, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedIds, themeId]
      : selectedIds.filter((id) => id !== themeId);
    
    setSelectedIds(newSelectedIds);
    onSelectionChange(newSelectedIds);
  };
  
  // Handle creating a new theme
  const handleCreateTheme = async () => {
    if (!newThemeName.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez saisir un nom pour la thématique',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const newTheme = await addTheme({
        name: newThemeName,
        description: newThemeDescription
      });
      
      if (newTheme) {
        toast({
          title: 'Thématique créée',
          description: 'La nouvelle thématique a été créée avec succès',
        });
        
        // Reset form and close dialog
        setNewThemeName('');
        setNewThemeDescription('');
        setIsNewThemeDialogOpen(false);
        
        // Refresh themes list
        await fetchThemesByFrameworkId(frameworkId);
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de créer la thématique',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la thématique',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full">
        <div className="flex items-center justify-between mb-2">
          <Input
            className="max-w-xs"
            placeholder="Rechercher des thématiques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewThemeDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle thématique
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {filteredThemes.length > 0 ? (
              filteredThemes.map((theme) => (
                <div key={theme.id} className="flex items-start space-x-2 py-1">
                  <Checkbox
                    id={`theme-${theme.id}`}
                    checked={selectedIds.includes(theme.id)}
                    onCheckedChange={(checked) =>
                      handleThemeChange(theme.id, checked === true)
                    }
                  />
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor={`theme-${theme.id}`}
                      className="font-medium"
                    >
                      {theme.name}
                    </Label>
                    {theme.description && (
                      <p className="text-sm text-muted-foreground">
                        {theme.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {searchTerm
                  ? 'Aucune thématique ne correspond à votre recherche'
                  : 'Aucune thématique disponible'}
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Create Theme Dialog */}
      <Dialog open={isNewThemeDialogOpen} onOpenChange={setIsNewThemeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle thématique</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle thématique pour les interviews d'audit
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="theme-name">Nom</Label>
              <Input
                id="theme-name"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Nom de la thématique"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="theme-description">Description</Label>
              <Textarea
                id="theme-description"
                value={newThemeDescription}
                onChange={(e) => setNewThemeDescription(e.target.value)}
                placeholder="Description de la thématique"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewThemeDialogOpen(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateTheme} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Créer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
