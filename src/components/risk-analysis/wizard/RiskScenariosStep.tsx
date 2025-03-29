import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, Plus, Database, Search, Filter, Check } from 'lucide-react';
import ScenarioTemplateSelect from '../ScenarioTemplateSelect';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

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
  onGenerateMoreScenarios: () => Promise<void>;
  onSaveAndClose: () => Promise<boolean>;
}

export function RiskScenariosStep({
  suggestedScenarios,
  loading,
  onSelectTemplate,
  onToggleScenario,
  onComplete,
  onPrevious,
  onGenerateMoreScenarios,
  onSaveAndClose
}: RiskScenariosStepProps) {
  const { toast } = useToast();
  const selectedCount = suggestedScenarios.filter(s => s.selected).length;
  const [generatingMore, setGeneratingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSaveAndClose = async () => {
    if (selectedCount === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const success = await onSaveAndClose();
      if (success) {
        toast({
          title: "Succès",
          description: `${selectedCount} scénario${selectedCount > 1 ? 's' : ''} enregistré${selectedCount > 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les scénarios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateMore = async () => {
    setGeneratingMore(true);
    try {
      await onGenerateMoreScenarios();
      toast({
        title: "Nouveaux scénarios",
        description: "De nouveaux scénarios ont été générés",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer de nouveaux scénarios",
        variant: "destructive",
      });
    } finally {
      setGeneratingMore(false);
    }
  };

  const filteredScenarios = suggestedScenarios.filter(
    scenario => searchTerm === '' || 
    scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[600px]">
      <DialogHeader className="pb-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">Étape 3 : Scénarios de risque</DialogTitle>
            <DialogDescription className="text-base">
              Sélectionnez les scénarios de risque pertinents pour votre analyse
            </DialogDescription>
          </div>
          
          <Button 
            onClick={handleSaveAndClose}
            disabled={loading || saving || selectedCount === 0}
            className="ml-auto"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Valider
              </>
            )}
          </Button>
        </div>
      </DialogHeader>
      
      <div className="flex flex-col gap-5 py-6 flex-grow overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="relative w-full md:w-auto md:flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un scénario..."
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateMore}
              disabled={loading || generatingMore}
              className="flex-1 md:flex-initial"
            >
              {generatingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  + de scénarios
                </>
              )}
            </Button>
            <ScenarioTemplateSelect onSelect={onSelectTemplate} />
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <span className="font-medium">Scénarios disponibles:</span>
            <Badge variant="outline" className="ml-2">
              {filteredScenarios.length}
            </Badge>
          </div>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full w-full pr-4">
            <div className="bg-card rounded-lg border shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Chargement des scénarios...</p>
                </div>
              ) : filteredScenarios.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  {searchTerm ? (
                    <>
                      <Filter className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="font-medium">Aucun résultat</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Aucun scénario ne correspond à votre recherche.
                      </p>
                    </>
                  ) : (
                    <>
                      <Filter className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="font-medium">Aucun scénario suggéré</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Utilisez le bouton "Utiliser un modèle" ou générez de nouveaux scénarios.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                  {filteredScenarios.map((scenario) => (
                    <div 
                      key={scenario.id} 
                      className={`group rounded-md border p-3 cursor-pointer transition-all ${
                        scenario.selected 
                          ? "border-primary bg-primary/5 hover:bg-primary/10" 
                          : "hover:border-muted-foreground/50 hover:bg-accent/30"
                      }`}
                      onClick={() => onToggleScenario(scenario.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium line-clamp-1 pr-2">{scenario.name}</h4>
                        <div className={`flex-shrink-0 h-5 w-5 rounded-full border ${
                          scenario.selected 
                            ? "border-primary bg-primary text-primary-foreground" 
                            : "border-muted-foreground/30"
                        } flex items-center justify-center transition-all`}>
                          {scenario.selected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {scenario.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <DialogFooter className="pt-4 border-t flex-shrink-0">
        <div className="flex w-full justify-between gap-3">
          <Button variant="outline" onClick={onPrevious}>
            Retour
          </Button>
          <Button 
            variant="secondary"
            onClick={handleComplete}
            disabled={loading || selectedCount === 0}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Continuer
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}
