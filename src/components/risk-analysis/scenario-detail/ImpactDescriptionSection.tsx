
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { RiskScenario } from '@/types';

interface ImpactDescriptionSectionProps {
  scenario: RiskScenario;
  isGenerating: boolean;
  onGenerateImpact: () => void;
}

const ImpactDescriptionSection: React.FC<ImpactDescriptionSectionProps> = ({
  scenario,
  isGenerating,
  onGenerateImpact
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Description de l'impact</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onGenerateImpact}
          disabled={isGenerating || !scenario.description}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Générer avec IA
            </>
          )}
        </Button>
      </div>
      <p className="text-gray-700 dark:text-gray-300">
        {scenario.impactDescription || "Aucune description d'impact fournie."}
      </p>
    </div>
  );
};

export default ImpactDescriptionSection;
