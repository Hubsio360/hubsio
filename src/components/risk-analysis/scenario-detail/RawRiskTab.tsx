
import React from 'react';
import { RiskScenario } from '@/types';

interface RawRiskTabProps {
  scenario: RiskScenario;
}

const RawRiskTab: React.FC<RawRiskTabProps> = ({ scenario }) => {
  // Helper function to get property value safely, handling both camelCase and snake_case
  const getProperty = <T,>(camelCase: string, snakeCase: string): T | undefined => {
    return scenario[camelCase as keyof RiskScenario] !== undefined 
      ? scenario[camelCase as keyof RiskScenario] as unknown as T 
      : scenario[snakeCase as keyof RiskScenario] as unknown as T;
  };

  // Get the raw impact value
  const rawImpact = getProperty<string>('rawImpact', 'raw_impact');
  
  // Get the raw likelihood value
  const rawLikelihood = getProperty<string>('rawLikelihood', 'raw_likelihood');
  
  // Get the raw risk level value
  const rawRiskLevel = getProperty<string>('rawRiskLevel', 'raw_risk_level');

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact brut</h4>
        <p className="text-xl font-semibold capitalize">
          {translateRiskLevel(rawImpact)}
        </p>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité brute</h4>
        <p className="text-xl font-semibold capitalize">
          {translateRiskLevel(rawLikelihood)}
        </p>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque brut</h4>
        <p className={`text-xl font-semibold capitalize ${
          rawRiskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
          rawRiskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
          rawRiskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' : 
          rawRiskLevel === 'critical' ? 'text-red-600 dark:text-red-400' : ''
        }`}>
          {translateRiskLevel(rawRiskLevel)}
        </p>
      </div>
    </div>
  );
};

export default RawRiskTab;
