
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { PlanGenerationOptions } from './types';
import { toast } from 'sonner';

export const usePlanGeneration = (
  auditId: string,
  startDate: string,
  endDate: string,
  onPlanGenerated?: (targetTab?: string) => void
) => {
  const [generating, setGenerating] = useState(false);
  const { generateAuditPlan, fetchThemes, fetchInterviewsByAuditId } = useData();
  const { toast: uiToast } = useToast();

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
      console.error("ID d'audit manquant lors de la génération du plan");
      toast.error("ID d'audit manquant");
      return;
    }

    console.log(`Démarrage de la génération pour l'audit ${auditId} avec ${selectedTopicIds.length} thématiques et ${selectedDays.length} jours`);

    // Si aucune thématique n'est sélectionnée, tenter de charger toutes les thématiques disponibles
    let topicsToUse = selectedTopicIds;
    
    if (selectedTopicIds.length === 0) {
      console.log("Aucune thématique sélectionnée, tentative de charger toutes les thématiques");
      try {
        const allThemes = await fetchThemes();
        topicsToUse = allThemes
          .filter(theme => !['ADMIN', 'Cloture'].includes(theme.name))
          .map(theme => theme.id);
          
        console.log(`Utilisation de ${topicsToUse.length} thématiques par défaut:`, topicsToUse);
        
        if (topicsToUse.length === 0) {
          toast.error("Impossible de trouver des thématiques. Veuillez contacter l'administrateur.");
          return;
        }
      } catch (error) {
        console.error("Impossible de charger les thématiques:", error);
        toast.error("Impossible de charger les thématiques. Veuillez réessayer.");
        return;
      }
    }

    if (selectedDays.length === 0) {
      console.error("Aucun jour sélectionné pour le plan d'audit");
      toast.error("Veuillez sélectionner au moins un jour pour les interviews");
      return;
    }

    if (selectedDays.length < requiredDays) {
      console.error(`Nombre de jours insuffisant: ${selectedDays.length} < ${requiredDays}`);
      toast.error(`Vous avez besoin d'au moins ${requiredDays} jours pour couvrir toutes les thématiques sélectionnées`);
      return;
    }

    setGenerating(true);

    try {
      console.log("Starting audit plan generation with data:", {
        auditId,
        startDate,
        endDate,
        topicIds: topicsToUse,
        selectedDays,
        themeDurations
      });
      
      // Créer des durées par défaut pour toutes les thématiques si nécessaire
      const durationsToUse = { ...themeDurations };
      topicsToUse.forEach(topicId => {
        if (!durationsToUse[topicId]) {
          durationsToUse[topicId] = 60; // 60 minutes par défaut
        }
      });
      
      const generationOptions: PlanGenerationOptions = {
        topicIds: topicsToUse,
        selectedDays: selectedDays,
        themeDurations: durationsToUse,
        maxHoursPerDay: maxHoursPerDay
      };
      
      console.log("Appel à la fonction generateAuditPlan avec les options:", generationOptions);
      
      const success = await generateAuditPlan(auditId, startDate, endDate, generationOptions);
      console.log("Résultat de generateAuditPlan:", success);

      if (success) {
        try {
          // Récupérer les interviews générées pour vérifier qu'elles existent
          console.log("Récupération des interviews générées...");
          const interviews = await fetchInterviewsByAuditId(auditId);
          console.log(`Plan généré avec succès, ${interviews.length} interviews créées:`, interviews);
          
          if (interviews.length === 0) {
            console.error("Aucune interview créée malgré le succès de la génération");
            throw new Error("Aucune interview générée");
          }
          
          toast.success(`Plan d'audit généré avec ${interviews.length} interviews planifiées`);

          if (onPlanGenerated) {
            // Explicitement rediriger vers l'onglet steps (étapes) après génération
            console.log("Redirection vers l'onglet steps (étapes)");
            onPlanGenerated('steps');
          }
        } catch (fetchError) {
          console.error("Erreur lors de la récupération des interviews:", fetchError);
          throw new Error("Le plan a été généré mais les interviews ne peuvent pas être récupérées");
        }
      } else {
        console.error("La génération du plan n'a pas abouti - aucun succès retourné");
        throw new Error("La génération du plan n'a pas abouti");
      }
    } catch (error) {
      console.error("Error generating audit plan:", error);
      toast.error("Impossible de générer le plan d'audit. Consultez les détails dans la console.");
      
      // Afficher un message détaillé dans l'UI en supplément
      uiToast({
        title: "Erreur détaillée",
        description: error instanceof Error ? error.message : "Erreur inconnue lors de la génération du plan.",
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
