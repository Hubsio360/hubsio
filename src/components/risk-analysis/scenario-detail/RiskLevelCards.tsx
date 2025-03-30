
import React from 'react';
import { RiskScenario } from '@/types';

interface RiskLevelCardsProps {
  scenario: RiskScenario;
}

const RiskLevelCards: React.FC<RiskLevelCardsProps> = ({ scenario }) => {
  // Helper function to translate risk levels to French
  const translateRiskLevel = (level: string | undefined) => {
    if (!level) return 'Non défini';
    
    switch(level) {
      case 'low': return 'Faible';
      case 'medium': return 'Moyen';
      case 'high': return 'Élevé';
      case 'critical': return 'Critique';
      default: return level;
    }
  };

  // Helper function to get color based on risk level
  const getRiskColor = (level: string | undefined) => {
    switch(level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return '';
    }
  };

  // Helper function to get badge class based on risk level
  const getRiskBadgeClass = (level: string | undefined) => {
    switch(level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact</h4>
        <div className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-sm ${getRiskBadgeClass(scenario.impactLevel)}`}>
          {translateRiskLevel(scenario.impactLevel)}
        </div>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité</h4>
        <div className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-sm ${getRiskBadgeClass(scenario.likelihood)}`}>
          {translateRiskLevel(scenario.likelihood)}
        </div>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque</h4>
        <div className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-sm ${getRiskBadgeClass(scenario.riskLevel)}`}>
          {translateRiskLevel(scenario.riskLevel)}
        </div>
      </div>
    </div>
  );
};

export default RiskLevelCards;
