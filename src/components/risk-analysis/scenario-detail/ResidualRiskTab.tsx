
import React from 'react';
import { RiskScenario } from '@/types';

interface ResidualRiskTabProps {
  scenario: RiskScenario;
}

const ResidualRiskTab: React.FC<ResidualRiskTabProps> = ({ scenario }) => {
  // Helper function to get property value safely, handling both camelCase and snake_case
  const getProperty = (camelCase: string, snakeCase: string) => {
    return scenario[camelCase] !== undefined ? scenario[camelCase] : scenario[snakeCase];
  };

  // Get security measures
  const securityMeasures = getProperty('securityMeasures', 'security_measures');
  
  // Get measure effectiveness
  const measureEffectiveness = getProperty('measureEffectiveness', 'measure_effectiveness');
  
  // Get residual impact
  const residualImpact = getProperty('residualImpact', 'residual_impact');
  
  // Get residual likelihood
  const residualLikelihood = getProperty('residualLikelihood', 'residual_likelihood');
  
  // Get residual risk level
  const residualRiskLevel = getProperty('residualRiskLevel', 'residual_risk_level');

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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Mesures de sécurité</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {securityMeasures || "Aucune mesure de sécurité spécifiée."}
        </p>
        
        <h3 className="text-lg font-medium mb-2">Efficacité des mesures</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {measureEffectiveness || "Aucune évaluation de l'efficacité des mesures."}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-4 border">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact résiduel</h4>
          <p className="text-xl font-semibold capitalize">
            {translateRiskLevel(residualImpact)}
          </p>
        </div>
        
        <div className="bg-background rounded-lg p-4 border">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité résiduelle</h4>
          <p className="text-xl font-semibold capitalize">
            {translateRiskLevel(residualLikelihood)}
          </p>
        </div>
        
        <div className="bg-background rounded-lg p-4 border">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque résiduel</h4>
          <p className={`text-xl font-semibold capitalize ${
            residualRiskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
            residualRiskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
            residualRiskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' : 
            residualRiskLevel === 'critical' ? 'text-red-600 dark:text-red-400' : ''
          }`}>
            {translateRiskLevel(residualRiskLevel)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResidualRiskTab;
