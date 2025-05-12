
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types';

interface EditClientDialogProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Partial<Company>) => Promise<void>;
}

export const EditClientDialog = ({ company, isOpen, onClose, onSave }: EditClientDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    activity: '',
    parentCompany: '',
    marketScope: '',
    creationYear: undefined,
  });

  // Update form data when company changes
  React.useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        activity: company.activity || '',
        parentCompany: company.parentCompany || '',
        marketScope: company.marketScope || '',
        creationYear: company.creationYear,
      });
    }
  }, [company]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'creationYear' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'entreprise est requis",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast({
        title: "Client modifié",
        description: "Les informations du client ont été mises à jour"
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le client",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du client
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'entreprise</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="activity">Activité principale</Label>
              <Input
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="creationYear">Année de création</Label>
              <Input
                id="creationYear"
                name="creationYear"
                type="number"
                value={formData.creationYear || ''}
                onChange={handleInputChange}
                min={1800}
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="parentCompany">Société mère</Label>
              <Input
                id="parentCompany"
                name="parentCompany"
                value={formData.parentCompany}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="marketScope">Portée du marché</Label>
              <Input
                id="marketScope"
                name="marketScope"
                value={formData.marketScope}
                onChange={handleInputChange}
                placeholder="Local, National, International..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
