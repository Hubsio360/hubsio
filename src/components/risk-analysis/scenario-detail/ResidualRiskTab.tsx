
import React from 'react';
import { RiskScenario } from '@/types';

interface ResidualRiskTabProps {
  scenario: RiskScenario;
}

const ResidualRiskTab: React.FC<ResidualRiskTabProps> = ({ scenario }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Mesures de sécurité</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {(scenario.securityMeasures || scenario.security_measures) || "Aucune mesure de sécurité spécifiée."}
        </p>
        
        <h3 className="text-lg font-medium mb-2">Efficacité des mesures</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {(scenario.measureEffectiveness || scenario.measure_effectiveness) || "Aucune évaluation de l'efficacité des mesures."}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-4 border">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact résiduel</h4>
          <p className="text-xl font-semibold capitalize">
            {(scenario.residualImpact || scenario.residual_impact) === 'low' ? 'Faible' :
            (scenario.residualImpact || scenario.residual_impact) === 'medium' ? 'Moyen' :
            (scenario.residualImpact || scenario.residual_impact) === 'high' ? 'Élevé' : 'Critique'}
          </p>
        </div>
        
        <div className="bg-background rounded-lg p-4 border">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité résiduelle</h4>
          <p className="text-xl font-semibold capitalize">
            {(scenario.residualLikelihood || scenario.residual_likelihood) === 'low' ? 'Faible' :
            (scenario.residualLikelihood || scenario.residual_likelihood) === 'medium' ? 'Moyen' :
            (scenario.residualLikelihood || scenario.residual_likelihood) === 'high' ? 'Élevé' : 'Critique'}
          </p>
        </div>
        
        <div className="bg-background rounded-lg p-4 border">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque résiduel</h4>
          <p className={`text-xl font-semibold capitalize ${
            (scenario.residualRiskLevel || scenario.residual_risk_level) === 'low' ? 'text-green-600 dark:text-green-400' :
            (scenario.residualRiskLevel || scenario.residual_risk_level) === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
            (scenario.residualRiskLevel || scenario.residual_risk_level) === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {(scenario.residualRiskLevel || scenario.residual_risk_level) === 'low' ? 'Faible' :
            (scenario.residualRiskLevel || scenario.residual_risk_level) === 'medium' ? 'Moyen' :
            (scenario.residualRiskLevel || scenario.residual_risk_level) === 'high' ? 'Élevé' : 'Critique'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResidualRiskTab;
