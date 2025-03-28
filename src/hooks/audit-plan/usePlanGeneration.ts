
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { PlanGenerationOptions } from './types';

export const usePlanGeneration = (
  auditId: string,
  startDate: string,
  endDate: string,
  onPlanGenerated?: (targetTab?: string) => void
) => {
  const [generating, setGenerating] = useState(false);
  const { generateAuditPlan } = useData();
  const { toast } = useToast();

  const generatePlan = async (
    options: {
      selectedTopicIds: string[];
      selectedDays: string[];
      themeDurations: Record<string, number>;
      maxHoursPerDay: number;
      requiredDays: number;
    }
  ) => {
    const { selectedTopicIds, selectedDays, themeDurations, maxHoursPerDay, requiredDays } = options;
    
    if (!auditId) {
      toast({
        title: "Erreur",
        description: "ID d'audit manquant",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopicIds.length === 0) {
      toast({
        title: "Thématiques requises",
        description: "Veuillez sélectionner au moins une thématique",
        variant: "destructive",
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Jours requis",
        description: "Veuillez sélectionner au moins un jour pour les interviews",
        variant: "destructive",
      });
      return;
    }

    if (selectedDays.length < requiredDays) {
      toast({
        title: "Jours insuffisants",
        description: `Vous avez besoin d'au moins ${requiredDays} jours pour couvrir toutes les thématiques sélectionnées`,
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      console.log("Starting audit plan generation with data:", {
        auditId,
        startDate,
        endDate,
        topicIds: selectedTopicIds,
        selectedDays,
        themeDurations
      });
      
      const generationOptions: PlanGenerationOptions = {
        topicIds: selectedTopicIds,
        selectedDays: selectedDays,
        themeDurations: themeDurations,
        maxHoursPerDay: maxHoursPerDay
      };
      
      const success = await generateAuditPlan(auditId, startDate, endDate, generationOptions);

      if (success) {
        toast({
          title: "Plan d'audit généré",
          description: "Le plan d'audit a été généré avec succès et enregistré en base de données",
        });

        if (onPlanGenerated) {
          onPlanGenerated('calendar');
        }
      } else {
        throw new Error("La génération du plan n'a pas abouti");
      }
    } catch (error) {
      console.error("Error generating audit plan:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le plan d'audit",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    generatePlan
  };
};
