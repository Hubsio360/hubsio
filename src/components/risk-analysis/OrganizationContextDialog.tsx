
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface OrganizationContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onEnrichSuccess: () => void;
}

export function OrganizationContextDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  onEnrichSuccess
}: OrganizationContextDialogProps) {
  const [organizationContext, setOrganizationContext] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enrichCompanyData } = useData();
  const { toast } = useToast();

  const handleEnrich = async () => {
    if (!organizationContext.trim()) {
      setError('Veuillez décrire le contexte de votre organisation');
      return;
    }
    
    setIsEnriching(true);
    setError(null);
    
    try {
      await enrichCompanyData(companyId);
      
      toast({
        title: "Analyse terminée",
        description: "Le contexte de l'organisation a été enrichi et les processus critiques ont été identifiés.",
      });
      
      onEnrichSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error enriching company data:', err);
      setError('Une erreur est survenue lors de l\'enrichissement des données. Veuillez réessayer.');
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Contexte de l'organisation</DialogTitle>
          <DialogDescription>
            Décrivez le contexte de votre organisation {companyName} pour améliorer l'analyse des risques
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="organization-context">Description du contexte</Label>
            <Textarea
              id="organization-context"
              placeholder="Décrivez votre organisation, ses activités principales, sa taille, ses parties prenantes, son marché, etc."
              className="min-h-[200px]"
              value={organizationContext}
              onChange={(e) => setOrganizationContext(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Ces informations seront utilisées pour enrichir le profil de votre organisation et identifier les processus critiques.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleEnrich} disabled={isEnriching}>
            {isEnriching ? (
              <>Enrichissement en cours...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enrichir avec IA
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
