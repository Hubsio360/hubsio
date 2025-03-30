
import React from 'react';
import { RiskScenario } from '@/types';

interface RiskLevelCardsProps {
  scenario: RiskScenario;
}

const RiskLevelCards: React.FC<RiskLevelCardsProps> = ({ scenario }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact</h4>
        <p className="text-xl font-semibold capitalize">
          {scenario.impactLevel === 'low' ? 'Faible' :
          scenario.impactLevel === 'medium' ? 'Moyen' :
          scenario.impactLevel === 'high' ? 'Élevé' : 'Critique'}
        </p>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité</h4>
        <p className="text-xl font-semibold capitalize">
          {scenario.likelihood === 'low' ? 'Faible' :
          scenario.likelihood === 'medium' ? 'Moyen' :
          scenario.likelihood === 'high' ? 'Élevé' : 'Critique'}
        </p>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque</h4>
        <p className={`text-xl font-semibold capitalize ${
          scenario.riskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
          scenario.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
          scenario.riskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {scenario.riskLevel === 'low' ? 'Faible' :
          scenario.riskLevel === 'medium' ? 'Moyen' :
          scenario.riskLevel === 'high' ? 'Élevé' : 'Critique'}
        </p>
      </div>
    </div>
  );
};

export default RiskLevelCards;
