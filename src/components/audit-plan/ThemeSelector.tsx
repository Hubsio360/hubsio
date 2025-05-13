
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Search } from 'lucide-react';
import { AuditTheme } from '@/types';

interface ThemeSelectorProps {
  auditId: string;
  frameworkId: string;
  selectedThemes: string[];
  onSelectTheme: (themeId: string) => void;
  onUnselectTheme: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  auditId, 
  frameworkId,
  selectedThemes,
  onSelectTheme,
  onUnselectTheme
}) => {
  const { themes, fetchThemesByFrameworkId, addTheme } = useData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [themesList, setThemesList] = useState<AuditTheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newThemeDialog, setNewThemeDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    const loadThemes = async () => {
      setLoading(true);
      try {
        const loadedThemes = await fetchThemesByFrameworkId(frameworkId);
        setThemesList(loadedThemes);
      } catch (error) {
        console.error('Error loading themes:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les thématiques',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, [frameworkId, fetchThemesByFrameworkId, toast]);

  const handleAddTheme = async () => {
    if (!newThemeName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la thématique est requis',
        variant: 'destructive',
      });
      return;
    }

    setSavingTheme(true);
    try {
      const newTheme = await addTheme({
        name: newThemeName,
        description: newThemeDescription
      });
      
      if (newTheme) {
        toast({
          title: 'Thématique ajoutée',
          description: 'La thématique a été ajoutée avec succès',
        });
        
        // Refresh themes list
        const updatedThemes = await fetchThemesByFrameworkId(frameworkId);
        setThemesList(updatedThemes);
        
        // Reset form and close dialog
        setNewThemeName('');
        setNewThemeDescription('');
        setNewThemeDialog(false);
      }
    } catch (error) {
      console.error('Error adding theme:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la thématique',
        variant: 'destructive',
      });
    } finally {
      setSavingTheme(false);
    }
  };

  const filteredThemes = themesList.filter(theme => 
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleThemeToggle = (themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      onUnselectTheme(themeId);
    } else {
      onSelectTheme(themeId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une thématique..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={newThemeDialog} onOpenChange={setNewThemeDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une thématique</DialogTitle>
              <DialogDescription>
                Créer une nouvelle thématique pour les audits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="theme-name">Nom de la thématique</Label>
                <Input 
                  id="theme-name" 
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Exemple: Sécurité des accès"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme-description">Description</Label>
                <Textarea 
                  id="theme-description"
                  value={newThemeDescription}
                  onChange={(e) => setNewThemeDescription(e.target.value)} 
                  placeholder="Description de la thématique..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewThemeDialog(false)}>Annuler</Button>
              <Button onClick={handleAddTheme} disabled={savingTheme}>
                {savingTheme ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      ) : filteredThemes.length > 0 ? (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {filteredThemes.map(theme => (
            <div 
              key={theme.id}
              className={`
                flex items-center p-2 rounded-md cursor-pointer
                ${selectedThemes.includes(theme.id) 
                  ? 'bg-primary/10 hover:bg-primary/15' 
                  : 'hover:bg-muted'}
              `}
              onClick={() => handleThemeToggle(theme.id)}
            >
              <div className="flex-1">
                <p className="font-medium">{theme.name}</p>
                {theme.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {theme.description}
                  </p>
                )}
              </div>
              <div className={`
                w-5 h-5 rounded-full border 
                ${selectedThemes.includes(theme.id) 
                  ? 'bg-primary border-primary' 
                  : 'border-input'}
              `} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">
            Aucune thématique trouvée{searchQuery ? ' pour cette recherche' : ''}
          </p>
          {searchQuery && (
            <Button variant="link" onClick={() => setSearchQuery('')}>
              Effacer la recherche
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
