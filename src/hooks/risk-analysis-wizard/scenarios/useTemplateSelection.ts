
import { useCallback } from 'react';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { SuggestedScenario } from '../types';

export function useTemplateSelection(
  setSuggestedScenarios: React.Dispatch<React.SetStateAction<SuggestedScenario[]>>
) {
  // Fonction pour gérer la sélection d'un modèle
  const handleTemplateSelect = useCallback((template: EnhancedTemplate) => {
    // Création d'un nouveau scénario basé sur le modèle
    const newScenario: SuggestedScenario = {
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: template.name,
      description: template.description,
      selected: true
    };
    
    // Ajout du nouveau scénario à la liste
    setSuggestedScenarios(prevScenarios => [...prevScenarios, newScenario]);
    
    return newScenario;
  }, [setSuggestedScenarios]);
  
  return { handleTemplateSelect };
}
