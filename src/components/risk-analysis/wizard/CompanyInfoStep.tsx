
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Search, ArrowRight, InfoIcon } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CompanyInfoStepProps {
  companyInfo: {
    name: string;
    description: string;
    activities: string;
  };
  loading: boolean;
  onCompanyNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onActivitiesChange: (activities: string) => void;
  onFetchInfo: () => void;
  onNext: () => void;
  onCancel: () => void;
}

export function CompanyInfoStep({
  companyInfo,
  loading,
  onCompanyNameChange,
  onDescriptionChange,
  onActivitiesChange,
  onFetchInfo,
  onNext,
  onCancel
}: CompanyInfoStepProps) {
  const handleSearchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFetchInfo();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Étape 1 : Informations sur l'entreprise</DialogTitle>
        <DialogDescription>
          Saisissez le nom de votre entreprise pour commencer l'analyse de risques
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSearchFormSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="company-name" className="text-sm font-medium">
            Nom de l'entreprise
          </label>
          <div className="flex gap-2">
            <Input
              id="company-name"
              value={companyInfo.name}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              placeholder="Ex: Acme Sécurité"
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="submit"
              onClick={onFetchInfo}
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
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Description de l'entreprise et de ses activités"
              className="min-h-[100px]"
            />
          </div>
        )}

        {companyInfo.activities && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="company-activities" className="text-sm font-medium">
                Processus métier clés
              </label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                    <InfoIcon className="h-3 w-3" />
                    <span className="sr-only">Info sur les processus métier</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Qu'est-ce qu'un processus métier ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Un processus métier est un ensemble d'activités coordonnées qui permettent
                      à une entreprise de créer de la valeur pour ses clients. C'est une séquence 
                      d'étapes qui contribuent à la réalisation des objectifs commerciaux.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Exemples :</span> Gestion des commandes clients, 
                      Recrutement de personnel, Développement de produits, etc.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <Textarea
              id="company-activities"
              value={companyInfo.activities}
              onChange={(e) => onActivitiesChange(e.target.value)}
              placeholder="Activités principales de l'entreprise"
              className="min-h-[120px]"
            />
          </div>
        )}
      </form>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          onClick={onNext}
          disabled={!companyInfo.description}
        >
          Suivant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );
}
