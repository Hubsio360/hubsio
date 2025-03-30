
import React from 'react';
import { RiskScenario } from '@/types';
import ColorScale from './ColorScale';

interface ResidualRiskTabProps {
  scenario: RiskScenario;
}

const ResidualRiskTab: React.FC<ResidualRiskTabProps> = ({ scenario }) => {
  // Helper function to get property value safely, handling both camelCase and snake_case
  const getProperty = <T,>(camelCase: string, snakeCase: string): T | undefined => {
    return scenario[camelCase as keyof RiskScenario] !== undefined 
      ? scenario[camelCase as keyof RiskScenario] as unknown as T 
      : scenario[snakeCase as keyof RiskScenario] as unknown as T;
  };

  // Get security measures
  const securityMeasures = getProperty<string>('securityMeasures', 'security_measures');
  
  // Get measure effectiveness
  const measureEffectiveness = getProperty<string>('measureEffectiveness', 'measure_effectiveness');
  
  // Get residual impact
  const residualImpact = getProperty<string>('residualImpact', 'residual_impact');
  
  // Get residual likelihood
  const residualLikelihood = getProperty<string>('residualLikelihood', 'residual_likelihood');
  
  // Get residual risk level
  const residualRiskLevel = getProperty<string>('residualRiskLevel', 'residual_risk_level');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">Mesures de sécurité</h3>
        <div className="p-4 bg-background border rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            {securityMeasures || "Aucune mesure de sécurité spécifiée."}
          </p>
        </div>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">Efficacité des mesures</h3>
        <div className="p-4 bg-background border rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            {measureEffectiveness || "Aucune évaluation de l'efficacité des mesures."}
          </p>
        </div>
      </div>
      
      <div className="bg-background rounded-lg p-6 border">
        <ColorScale 
          value={residualImpact || 'low'} 
          title="Impact résiduel" 
          description="Évaluation de l'impact potentiel après application des mesures de sécurité."
        />
      </div>
      
      <div className="bg-background rounded-lg p-6 border">
        <ColorScale 
          value={residualLikelihood || 'low'} 
          title="Probabilité résiduelle" 
          description="Évaluation de la probabilité après application des mesures de sécurité."
        />
      </div>
      
      <div className="bg-background rounded-lg p-6 border">
        <h4 className="text-xl font-semibold mb-4">Niveau de risque résiduel</h4>
        <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium text-sm ${
          residualRiskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          residualRiskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          residualRiskLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
          residualRiskLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {residualRiskLevel === 'low' ? 'FAIBLE' :
           residualRiskLevel === 'medium' ? 'MOYEN' :
           residualRiskLevel === 'high' ? 'ÉLEVÉ' : 
           residualRiskLevel === 'critical' ? 'CRITIQUE' : 'NON DÉFINI'}
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Niveau calculé automatiquement à partir de l'impact résiduel et de la probabilité résiduelle
        </p>
      </div>
    </div>
  );
};

export default ResidualRiskTab;
