
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generatePlanSchedule } from '@/contexts/data/utils/interviewPlanGenerator';

interface UsePlanGenerationProps {
  selectedTopicIds: string[];
  selectedDays: string[];
  themeDurations: Record<string, number>;
  maxHoursPerDay: number;
  requiredDays: number;
}

export const usePlanGeneration = (
  auditId: string, 
  startDate: string, 
  endDate: string,
  onPlanGenerated?: (targetTab?: string) => void
) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generatePlan = async ({ 
    selectedTopicIds,
    selectedDays,
    themeDurations,
    maxHoursPerDay,
    requiredDays
  }: UsePlanGenerationProps) => {
    try {
      if (selectedDays.length < requiredDays) {
        toast({
          title: "Jours insuffisants",
          description: `Vous devez sélectionner au moins ${requiredDays} jours pour ce plan d'audit.`,
          variant: "destructive"
        });
        return;
      }

      setGenerating(true);
      
      const result = await generatePlanSchedule(auditId, startDate, endDate, {
        topicIds: selectedTopicIds,
        selectedDays,
        themeDurations,
        maxHoursPerDay
      });

      if (result) {
        toast({
          title: "Plan d'audit généré",
          description: "Le plan d'audit a été généré avec succès.",
          variant: "success"
        });
        if (onPlanGenerated) {
          onPlanGenerated("calendar");
        }
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération du plan d'audit.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du plan:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du plan d'audit.",
        variant: "destructive"
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
