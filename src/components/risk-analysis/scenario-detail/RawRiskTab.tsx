
import React from 'react';
import { RiskScenario, RiskLevel } from '@/types';
import ColorScale from './ColorScale';

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
  const rawImpact = getProperty<RiskLevel>('rawImpact', 'raw_impact') || 'low';
  
  // Get the raw likelihood value
  const rawLikelihood = getProperty<RiskLevel>('rawLikelihood', 'raw_likelihood') || 'low';
  
  // Get the raw risk level value
  const rawRiskLevel = getProperty<string>('rawRiskLevel', 'raw_risk_level');

  return (
    <div className="space-y-8">
      <div className="bg-background rounded-lg p-6 border">
        <ColorScale 
          value={rawImpact} 
          title="Impact brut" 
          description="Évaluation de l'impact potentiel si le risque se concrétise, sans tenir compte des mesures de protection."
        />
      </div>
      
      <div className="bg-background rounded-lg p-6 border">
        <ColorScale 
          value={rawLikelihood} 
          title="Probabilité brute" 
          description="Évaluation de la probabilité que le risque se concrétise, sans tenir compte des mesures de protection."
        />
      </div>
      
      <div className="bg-background rounded-lg p-6 border">
        <h4 className="text-xl font-semibold mb-4">Niveau de risque brut</h4>
        <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium text-sm ${
          rawRiskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          rawRiskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          rawRiskLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
          rawRiskLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {rawRiskLevel === 'low' ? 'FAIBLE' :
           rawRiskLevel === 'medium' ? 'MOYEN' :
           rawRiskLevel === 'high' ? 'ÉLEVÉ' : 
           rawRiskLevel === 'critical' ? 'CRITIQUE' : 'NON DÉFINI'}
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Niveau calculé automatiquement à partir de l'impact et de la probabilité
        </p>
      </div>
    </div>
  );
};

export default RawRiskTab;
