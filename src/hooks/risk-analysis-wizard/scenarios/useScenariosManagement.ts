
import { useState } from 'react';
import { SuggestedScenario } from '../types';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { useToast } from '@/hooks/use-toast';

export function useScenariosManagement() {
  const { toast } = useToast();
  const [suggestedScenarios, setSuggestedScenarios] = useState<SuggestedScenario[]>([]);

  // Handle template selection
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

  // Toggle scenario selection
  const toggleScenarioSelection = (id: string) => {
    setSuggestedScenarios(
      suggestedScenarios.map(scenario => 
        scenario.id === id 
          ? { ...scenario, selected: !scenario.selected } 
          : scenario
      )
    );
  };

  return {
    suggestedScenarios,
    setSuggestedScenarios,
    handleTemplateSelect,
    toggleScenarioSelection
  };
}
