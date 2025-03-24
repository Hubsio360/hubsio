
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FrameworkControl } from '@/types';

interface EditControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  control: FrameworkControl | null;
}

export const EditControlDialog = ({ open, onOpenChange, control }: EditControlDialogProps) => {
  const { updateControl } = useData();
  const { toast } = useToast();
  const [isEditingControl, setIsEditingControl] = useState(false);
  const [editControlFormData, setEditControlFormData] = useState({
    referenceCode: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    if (control) {
      setEditControlFormData({
        referenceCode: control.referenceCode,
        title: control.title,
        description: control.description || '',
      });
    }
  }, [control]);

  const submitEditControl = async () => {
    if (!control) return;
    
    if (!editControlFormData.referenceCode || !editControlFormData.title) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditingControl(true);
    
    try {
      const updatedControl = await updateControl(control.id, {
        referenceCode: editControlFormData.referenceCode,
        title: editControlFormData.title,
        description: editControlFormData.description
      });
      
      toast({
        title: "Contrôle mis à jour",
        description: `${updatedControl.referenceCode} - ${updatedControl.title} a été mis à jour avec succès`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contrôle:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du contrôle",
        variant: "destructive",
      });
    } finally {
      setIsEditingControl(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le contrôle</DialogTitle>
          <DialogDescription>
            Modifiez les informations du contrôle.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-control-code">Code de référence</Label>
            <Input
              id="edit-control-code"
              value={editControlFormData.referenceCode}
              onChange={(e) => setEditControlFormData({ ...editControlFormData, referenceCode: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-control-title">Titre</Label>
            <Input
              id="edit-control-title"
              value={editControlFormData.title}
              onChange={(e) => setEditControlFormData({ ...editControlFormData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-control-description">Description</Label>
            <Textarea
              id="edit-control-description"
              value={editControlFormData.description}
              onChange={(e) => setEditControlFormData({ ...editControlFormData, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={submitEditControl} disabled={isEditingControl}>
            {isEditingControl ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
