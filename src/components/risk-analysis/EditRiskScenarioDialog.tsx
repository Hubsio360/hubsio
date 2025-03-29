
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiskScenario, RiskLevel, RiskScope, RiskStatus } from '@/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditRiskScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: RiskScenario | null;
  onSave: (scenario: Partial<RiskScenario>) => Promise<boolean>;
}

export function EditRiskScenarioDialog({
  open,
  onOpenChange,
  scenario,
  onSave
}: EditRiskScenarioDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [impactDescription, setImpactDescription] = useState('');
  const [impactLevel, setImpactLevel] = useState<RiskLevel>('medium');
  const [likelihood, setLikelihood] = useState<RiskLevel>('medium');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [scope, setScope] = useState<RiskScope>('technical');
  const [status, setStatus] = useState<RiskStatus>('identified');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (scenario) {
      setName(scenario.name || '');
      setDescription(scenario.description || '');
      setImpactDescription(scenario.impactDescription || '');
      setImpactLevel(scenario.impactLevel || 'medium');
      setLikelihood(scenario.likelihood || 'medium');
      setRiskLevel(scenario.riskLevel || 'medium');
      setScope(scenario.scope || 'technical');
      setStatus(scenario.status || 'identified');
    }
  }, [scenario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scenario) return;
    
    setSaving(true);
    
    try {
      const updatedScenario: Partial<RiskScenario> = {
        name,
        description,
        impactDescription,
        impactLevel,
        likelihood,
        riskLevel,
        scope,
        status
      };
      
      const success = await onSave(updatedScenario);
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du scénario:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le scénario de risque",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier le scénario de risque</DialogTitle>
          <DialogDescription>
            Modifiez les détails du scénario et l'évaluation des impacts
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du scénario</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="impactDescription">Description de l'impact</Label>
            <Textarea
              id="impactDescription"
              value={impactDescription}
              onChange={(e) => setImpactDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="impactLevel">Niveau d'impact</Label>
              <Select
                value={impactLevel}
                onValueChange={(value: RiskLevel) => setImpactLevel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Niveau d'impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="likelihood">Probabilité</Label>
              <Select
                value={likelihood}
                onValueChange={(value: RiskLevel) => setLikelihood(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Probabilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="critical">Très élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Niveau de risque</Label>
              <Select
                value={riskLevel}
                onValueChange={(value: RiskLevel) => setRiskLevel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Niveau de risque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scope">Portée</Label>
              <Select
                value={scope}
                onValueChange={(value: RiskScope) => setScope(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Portée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technique</SelectItem>
                  <SelectItem value="organizational">Organisationnelle</SelectItem>
                  <SelectItem value="human">Humaine</SelectItem>
                  <SelectItem value="physical">Physique</SelectItem>
                  <SelectItem value="environmental">Environnementale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={status}
              onValueChange={(value: RiskStatus) => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="identified">Identifié</SelectItem>
                <SelectItem value="analyzed">Analysé</SelectItem>
                <SelectItem value="treated">Traité</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="monitored">Surveillé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
