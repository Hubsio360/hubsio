
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface AddControlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  frameworkId: string;
}

export function AddControlDialog({ isOpen, onClose, frameworkId }: AddControlDialogProps) {
  const { addControl } = useData();
  const { toast } = useToast();
  
  const [referenceCode, setReferenceCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceCode.trim() || !title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le code de référence et le titre sont requis',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await addControl({
        frameworkId,
        referenceCode,
        title,
        description: description || undefined,
      });
      
      toast({
        title: 'Contrôle ajouté',
        description: 'Le contrôle a été ajouté avec succès',
      });
      
      // Reset form
      setReferenceCode('');
      setTitle('');
      setDescription('');
      
      onClose();
    } catch (error) {
      console.error('Error adding control:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout du contrôle',
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
          <DialogTitle>Ajouter un contrôle</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau contrôle au référentiel
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="referenceCode">Code de référence</Label>
            <Input
              id="referenceCode"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="Ex: A.1.2"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du contrôle"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du contrôle"
              className="min-h-[100px]"
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
                  Ajout...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Ajouter
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
