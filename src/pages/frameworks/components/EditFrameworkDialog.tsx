
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Framework } from '@/types';

interface EditFrameworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  framework: Framework | null;
}

export const EditFrameworkDialog = ({ open, onOpenChange, framework }: EditFrameworkDialogProps) => {
  const { updateFramework } = useData();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', version: '' });

  useEffect(() => {
    if (framework) {
      setEditFormData({
        name: framework.name,
        version: framework.version
      });
    }
  }, [framework]);

  const submitEdit = async () => {
    if (!framework) return;
    
    if (!editFormData.name || !editFormData.version) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditing(true);
    
    try {
      const updatedFramework = await updateFramework(framework.id, {
        name: editFormData.name,
        version: editFormData.version
      });
      
      toast({
        title: "Référentiel mis à jour",
        description: `${updatedFramework.name} v${updatedFramework.version} a été mis à jour avec succès`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le référentiel</DialogTitle>
          <DialogDescription>
            Modifiez les informations du référentiel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom</Label>
            <Input
              id="edit-name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-version">Version</Label>
            <Input
              id="edit-version"
              value={editFormData.version}
              onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={submitEdit} disabled={isEditing}>
            {isEditing ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
