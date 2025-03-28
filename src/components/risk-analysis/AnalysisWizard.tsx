
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Plus, Loader2, CornerDownRight, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScenarioTemplateSelect from './ScenarioTemplateSelect';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { useData } from '@/contexts/DataContext';

interface AnalysisWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName?: string;
  onComplete?: () => void;
}

// Type for a key business process
interface BusinessProcess {
  id: string;
  name: string;
  description?: string;
}

// Type for a suggested risk scenario
interface SuggestedScenario {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export function AnalysisWizard({ 
  open, 
  onOpenChange, 
  companyId, 
  companyName = '', 
  onComplete 
}: AnalysisWizardProps) {
  const { toast } = useToast();
  const { createRiskScenario } = useData();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: companyName,
    description: '',
    activities: ''
  });
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);
  const [newProcess, setNewProcess] = useState('');
  const [suggestedScenarios, setSuggestedScenarios] = useState<SuggestedScenario[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Gérer la fermeture de la modale
  const handleClose = () => {
    if (step > 1 && !confirmDialogOpen) {
      setConfirmDialogOpen(true);
    } else {
      resetAndClose();
    }
  };

  // Réinitialiser l'état et fermer
  const resetAndClose = () => {
    setStep(1);
    setConfirmDialogOpen(false);
    onOpenChange(false);
  };

  // Fonction pour rechercher les informations de l'entreprise via OpenAI
  const fetchCompanyInfo = async () => {
    if (!companyInfo.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom de l'entreprise",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Appel de la fonction Edge pour obtenir les infos de l\'entreprise');
      const { data, error } = await supabase.functions.invoke('ai-risk-analysis', {
        body: {
          action: 'getCompanyInfo',
          data: { companyName: companyInfo.name.trim() }
        }
      });

      if (error) {
        console.error('Erreur lors de l\'appel à la fonction Edge:', error);
        throw new Error(`Erreur lors de la récupération des données: ${error.message}`);
      }

      console.log('Données reçues de la fonction Edge:', data);
      
      // Mise à jour des informations de l'entreprise
      setCompanyInfo(prev => ({
        ...prev, 
        description: data.description || '',
        activities: data.activities || ''
      }));

      // Extraire et créer automatiquement les processus métier à partir des activités
      const processLines = (data.activities || '').split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(1).trim());
      
      if (processLines.length > 0) {
        setBusinessProcesses(
          processLines.map((process, index) => ({
            id: `process-${Date.now()}-${index}`,
            name: process
          }))
        );
      }

      setLoading(false);
      toast({
        title: "Succès",
        description: "Informations sur l'entreprise récupérées avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de récupérer les informations de l'entreprise",
        variant: "destructive",
      });
    }
  };

  // Ajouter un nouveau processus métier
  const addBusinessProcess = () => {
    if (!newProcess.trim()) return;
    
    const newProcessItem: BusinessProcess = {
      id: `process-${Date.now()}`,
      name: newProcess.trim()
    };
    
    setBusinessProcesses([...businessProcesses, newProcessItem]);
    setNewProcess('');
  };

  // Supprimer un processus métier
  const removeBusinessProcess = (id: string) => {
    setBusinessProcesses(businessProcesses.filter(process => process.id !== id));
  };

  // Générer des scénarios de risque basés sur les processus métier via OpenAI
  const generateRiskScenarios = async () => {
    if (businessProcesses.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez ajouter au moins un processus métier",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Appel de la fonction Edge pour générer des scénarios');
      const { data, error } = await supabase.functions.invoke('ai-risk-analysis', {
        body: {
          action: 'generateRiskScenarios',
          data: { 
            companyName: companyInfo.name,
            businessProcesses: businessProcesses.map(bp => bp.name)
          }
        }
      });

      if (error) {
        console.error('Erreur lors de l\'appel à la fonction Edge:', error);
        throw new Error(`Erreur lors de la génération des scénarios: ${error.message}`);
      }

      console.log('Scénarios reçus de la fonction Edge:', data);
      
      // Si data est un array, l'utiliser directement, sinon vérifier s'il y a une propriété pour les scénarios
      const scenarios = Array.isArray(data) ? data : (data.scenarios || []);
      
      if (scenarios.length === 0) {
        throw new Error('Aucun scénario n\'a été généré. Veuillez réessayer ou affiner les processus métier.');
      }

      setSuggestedScenarios(scenarios);
      setLoading(false);
      toast({
        title: "Succès",
        description: `${scenarios.length} scénarios de risque générés avec succès`,
      });
    } catch (error) {
      console.error("Erreur lors de la génération des scénarios:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer les scénarios de risque",
        variant: "destructive",
      });
    }
  };

  // Gérer la sélection d'un modèle de scénario
  const handleTemplateSelect = (template: EnhancedTemplate) => {
    const newScenario: SuggestedScenario = {
      id: `scenario-${Date.now()}`,
      name: template.name,
      description: template.description,
      selected: true
    };
    
    setSuggestedScenarios([...suggestedScenarios, newScenario]);
    
    toast({
      title: "Scénario ajouté",
      description: `Le scénario "${template.name}" a été ajouté à la liste`,
    });
  };

  // Basculer la sélection d'un scénario
  const toggleScenarioSelection = (id: string) => {
    setSuggestedScenarios(
      suggestedScenarios.map(scenario => 
        scenario.id === id 
          ? { ...scenario, selected: !scenario.selected } 
          : scenario
      )
    );
  };

  // Sauvegarder les scénarios sélectionnés
  const saveScenarios = async () => {
    const selectedScenarios = suggestedScenarios.filter(scenario => scenario.selected);
    
    if (selectedScenarios.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un scénario de risque",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Enregistrer chaque scénario sélectionné
      for (const scenario of selectedScenarios) {
        await createRiskScenario({
          companyId,
          name: scenario.name,
          description: scenario.description,
          status: 'identified',
          scope: 'technical',
          riskLevel: 'medium',
          impactLevel: 'medium',
          likelihood: 'medium',
          // Valeurs par défaut pour les autres champs
          rawImpact: 'medium',
          rawLikelihood: 'medium',
          rawRiskLevel: 'medium',
          residualImpact: 'low',
          residualLikelihood: 'low',
          residualRiskLevel: 'low'
        });
      }

      toast({
        title: "Succès",
        description: `${selectedScenarios.length} scénarios de risque ont été créés avec succès`,
      });
      
      if (onComplete) {
        onComplete();
      }
      
      resetAndClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des scénarios:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les scénarios de risque",
        variant: "destructive",
      });
    }
  };

  // Avancer à l'étape suivante
  const goToNextStep = async () => {
    if (step === 2) {
      // Avant de passer à l'étape 3, générer les scénarios
      await generateRiskScenarios();
    }
    
    if (step === 3) {
      // À la dernière étape, sauvegarder les scénarios
      await saveScenarios();
      return;
    }
    
    setStep(step + 1);
  };

  // Revenir à l'étape précédente
  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  // Contenu de l'étape 1: Informations sur l'entreprise
  const renderStep1 = () => (
    <>
      <DialogHeader>
        <DialogTitle>Étape 1 : Informations sur l'entreprise</DialogTitle>
        <DialogDescription>
          Saisissez le nom de votre entreprise pour commencer l'analyse de risques
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="company-name" className="text-sm font-medium">
            Nom de l'entreprise
          </label>
          <div className="flex gap-2">
            <Input
              id="company-name"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Acme Sécurité"
              className="flex-1"
            />
            <Button 
              onClick={fetchCompanyInfo}
              disabled={loading || !companyInfo.name.trim()}
              size="sm" 
              className="whitespace-nowrap"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Rechercher
            </Button>
          </div>
        </div>

        {companyInfo.description && (
          <div className="space-y-2">
            <label htmlFor="company-description" className="text-sm font-medium">
              Profil de l'entreprise
            </label>
            <Textarea
              id="company-description"
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'entreprise et de ses activités"
              className="min-h-[100px]"
            />
          </div>
        )}

        {companyInfo.activities && (
          <div className="space-y-2">
            <label htmlFor="company-activities" className="text-sm font-medium">
              Activités et processus clés
            </label>
            <Textarea
              id="company-activities"
              value={companyInfo.activities}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, activities: e.target.value }))}
              placeholder="Activités principales de l'entreprise"
              className="min-h-[120px]"
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>
          Annuler
        </Button>
        <Button 
          onClick={goToNextStep}
          disabled={!companyInfo.description || !companyInfo.activities}
        >
          Suivant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );

  // Contenu de l'étape 2: Processus métier
  const renderStep2 = () => (
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
                addBusinessProcess();
              }
            }}
          />
          <Button 
            onClick={addBusinessProcess}
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
                      onClick={() => removeBusinessProcess(process.id)}
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
        <Button variant="outline" onClick={goToPreviousStep}>
          Retour
        </Button>
        <Button 
          onClick={goToNextStep}
          disabled={businessProcesses.length === 0}
        >
          Suivant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );

  // Contenu de l'étape 3: Scénarios de risque
  const renderStep3 = () => (
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
              <ScenarioTemplateSelect onSelect={handleTemplateSelect} />
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
                    onClick={() => toggleScenarioSelection(scenario.id)}
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
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={goToPreviousStep}>
          Retour
        </Button>
        <Button 
          onClick={goToNextStep}
          disabled={loading || suggestedScenarios.filter(s => s.selected).length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              Terminer
              <CornerDownRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-[700px] max-h-[90vh] flex flex-col"
          onInteractOutside={(e) => {
            if (step > 1) {
              e.preventDefault();
              setConfirmDialogOpen(true);
            }
          }}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir quitter ?</AlertDialogTitle>
            <AlertDialogDescription>
              Si vous quittez maintenant, les modifications que vous avez apportées ne seront pas enregistrées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={resetAndClose}>Quitter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
