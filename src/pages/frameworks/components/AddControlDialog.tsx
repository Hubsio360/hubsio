
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Framework } from '@/types';

interface AddControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  framework: Framework | null;
}

export const AddControlDialog = ({ open, onOpenChange, framework }: AddControlDialogProps) => {
  const { addControl } = useData();
  const { toast } = useToast();
  const [isAddingControl, setIsAddingControl] = useState(false);
  const [editControlFormData, setEditControlFormData] = useState({
    referenceCode: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    if (open) {
      setEditControlFormData({
        referenceCode: '',
        title: '',
        description: ''
      });
    }
  }, [open]);

  const submitAddControl = async () => {
    if (!framework) return;
    
    if (!editControlFormData.referenceCode || !editControlFormData.title) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingControl(true);
    
    try {
      const newControl = await addControl({
        frameworkId: framework.id,
        referenceCode: editControlFormData.referenceCode,
        title: editControlFormData.title,
        description: editControlFormData.description
      });
      
      toast({
        title: "Contrôle ajouté",
        description: `${newControl.referenceCode} - ${newControl.title} a été ajouté avec succès`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du contrôle:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du contrôle",
        variant: "destructive",
      });
    } finally {
      setIsAddingControl(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un contrôle</DialogTitle>
          <DialogDescription>
            {framework && `Ajoutez un nouveau contrôle au référentiel ${framework.name}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="add-control-code">Code de référence</Label>
            <Input
              id="add-control-code"
              value={editControlFormData.referenceCode}
              onChange={(e) => setEditControlFormData({ ...editControlFormData, referenceCode: e.target.value })}
              placeholder="Ex: A.5.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-control-title">Titre</Label>
            <Input
              id="add-control-title"
              value={editControlFormData.title}
              onChange={(e) => setEditControlFormData({ ...editControlFormData, title: e.target.value })}
              placeholder="Titre du contrôle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-control-description">Description</Label>
            <Textarea
              id="add-control-description"
              value={editControlFormData.description}
              onChange={(e) => setEditControlFormData({ ...editControlFormData, description: e.target.value })}
              placeholder="Description détaillée du contrôle"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button onClick={submitAddControl} disabled={isAddingControl}>
            {isAddingControl ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
