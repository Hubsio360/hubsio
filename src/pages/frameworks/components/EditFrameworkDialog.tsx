
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Framework } from '@/types';
import { Loader2, Save } from 'lucide-react';

interface EditFrameworkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  framework?: Framework | null;
}

export function EditFrameworkDialog({
  isOpen,
  onClose,
  isCreating,
  framework,
}: EditFrameworkDialogProps) {
  const { addFramework, updateFramework, refreshFrameworks } = useData();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize form when dialog opens
    if (isOpen && framework && !isCreating) {
      setName(framework.name);
      setVersion(framework.version);
    } else if (isOpen && isCreating) {
      // Reset form for creation
      setName('');
      setVersion('1.0');
    }
  }, [isOpen, framework, isCreating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du référentiel est requis',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isCreating) {
        await addFramework(name, version);
        toast({
          title: 'Référentiel créé',
          description: 'Le référentiel a été créé avec succès',
        });
      } else if (framework) {
        await updateFramework(framework.id, name, version);
        toast({
          title: 'Référentiel mis à jour',
          description: 'Le référentiel a été mis à jour avec succès',
        });
      }
      
      await refreshFrameworks();
      onClose();
    } catch (error) {
      console.error('Error saving framework:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Ajouter un référentiel' : 'Modifier le référentiel'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Créez un nouveau référentiel d\'audit'
              : 'Modifiez les détails du référentiel d\'audit'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du référentiel"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreating ? 'Création...' : 'Mise à jour...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isCreating ? 'Créer' : 'Mettre à jour'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
