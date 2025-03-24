
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Framework } from '@/types';

interface DeleteFrameworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  framework: Framework | null;
}

export const DeleteFrameworkDialog = ({ open, onOpenChange, framework }: DeleteFrameworkDialogProps) => {
  const { deleteFramework } = useData();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const submitDelete = async () => {
    if (!framework) {
      console.error("Tentative de suppression sans framework sélectionné");
      return;
    }
    
    console.log("Début de la suppression du framework:", framework);
    setIsDeleting(true);
    
    try {
      await deleteFramework(framework.id);
      
      console.log("Framework supprimé avec succès:", framework.id);
      
      toast({
        title: "Référentiel supprimé",
        description: `${framework.name} a été supprimé avec succès`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le référentiel</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce référentiel ? Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 py-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Tous les contrôles associés à ce référentiel seront également supprimés.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={submitDelete} disabled={isDeleting}>
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
