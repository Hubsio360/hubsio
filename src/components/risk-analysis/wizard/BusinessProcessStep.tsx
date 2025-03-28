
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
import { X, Plus, ArrowRight } from 'lucide-react';

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
}

export function BusinessProcessStep({
  businessProcesses,
  onAddProcess,
  onRemoveProcess,
  onNext,
  onPrevious
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

      <DialogFooter>
        <Button variant="outline" onClick={onPrevious}>
          Retour
        </Button>
        <Button 
          onClick={onNext}
          disabled={businessProcesses.length === 0}
        >
          Suivant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );
}
