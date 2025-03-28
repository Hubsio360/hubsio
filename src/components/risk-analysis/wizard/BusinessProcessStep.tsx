
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BusinessProcess {
  id: string;
  name: string;
  description?: string;
}

interface BusinessProcessStepProps {
  businessProcesses: BusinessProcess[];
  onAddProcess: (process: string) => void;
  onRemoveProcess: (id: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  generatingScenarios?: boolean;
  generationProgress?: number;
}

export function BusinessProcessStep({
  businessProcesses,
  onAddProcess,
  onRemoveProcess,
  onNext,
  onPrevious,
  generatingScenarios = false,
  generationProgress = 0
}: BusinessProcessStepProps) {
  const [newProcess, setNewProcess] = useState('');

  const handleAddProcess = () => {
    if (!newProcess.trim()) return;
    
    onAddProcess(newProcess);
    setNewProcess('');
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Étape 2 : Processus métier</DialogTitle>
        <DialogDescription>
          Identifiez les processus métier clés à inclure dans l'analyse de risques
        </DialogDescription>
      </DialogHeader>
      
      {generatingScenarios ? (
        <div className="py-8 space-y-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <h3 className="font-medium text-lg">Génération des scénarios en cours...</h3>
            <p className="text-sm text-muted-foreground">
              Veuillez patienter pendant que nous analysons vos processus métier et générons des scénarios de risque pertinents.
            </p>
          </div>
          <div className="space-y-2">
            <Progress value={generationProgress} className="h-2" />
            <p className="text-xs text-right text-muted-foreground">{Math.round(generationProgress)}%</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={newProcess}
              onChange={(e) => setNewProcess(e.target.value)}
              placeholder="Ajouter un processus métier"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddProcess();
                }
              }}
            />
            <Button 
              onClick={handleAddProcess}
              disabled={!newProcess.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="text-sm font-medium mb-2">Processus métier à analyser</h3>
            
            {businessProcesses.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Aucun processus métier ajouté. Veuillez en ajouter au moins un.
              </p>
            ) : (
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {businessProcesses.map((process) => (
                    <div 
                      key={process.id} 
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span className="text-sm">{process.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveProcess(process.id)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onPrevious} disabled={generatingScenarios}>
          Retour
        </Button>
        <Button 
          onClick={onNext}
          disabled={businessProcesses.length === 0 || generatingScenarios}
        >
          {generatingScenarios ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
