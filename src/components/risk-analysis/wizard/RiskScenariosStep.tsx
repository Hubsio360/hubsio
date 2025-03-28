
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle } from 'lucide-react';
import ScenarioTemplateSelect from '../ScenarioTemplateSelect';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { useToast } from '@/hooks/use-toast';

interface SuggestedScenario {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface RiskScenariosStepProps {
  suggestedScenarios: SuggestedScenario[];
  loading: boolean;
  onSelectTemplate: (template: EnhancedTemplate) => void;
  onToggleScenario: (id: string) => void;
  onComplete: () => void;
  onPrevious: () => void;
}

export function RiskScenariosStep({
  suggestedScenarios,
  loading,
  onSelectTemplate,
  onToggleScenario,
  onComplete,
  onPrevious
}: RiskScenariosStepProps) {
  const { toast } = useToast();
  const selectedCount = suggestedScenarios.filter(s => s.selected).length;

  const handleComplete = () => {
    if (selectedCount === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return;
    }
    
    onComplete();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Étape 3 : Scénarios de risque</DialogTitle>
        <DialogDescription>
          Sélectionnez les scénarios de risque pertinents pour votre analyse
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Scénarios suggérés</h3>
            <div className="flex gap-2">
              <ScenarioTemplateSelect onSelect={onSelectTemplate} />
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestedScenarios.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Aucun scénario suggéré. Utilisez le bouton "Utiliser un modèle" pour ajouter des scénarios.
            </p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {suggestedScenarios.map((scenario) => (
                  <div 
                    key={scenario.id} 
                    className={`rounded-md border p-3 cursor-pointer transition-colors ${
                      scenario.selected ? "border-primary bg-accent/40" : "hover:bg-accent/20"
                    }`}
                    onClick={() => onToggleScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant={scenario.selected ? "default" : "outline"}>
                        {scenario.selected ? "Sélectionné" : "Non sélectionné"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {scenario.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {selectedCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedCount} scénario{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <DialogFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Retour
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={loading || selectedCount === 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              Terminer
              <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
