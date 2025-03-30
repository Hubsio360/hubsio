
import React from 'react';
import { RiskScenario } from '@/types';

interface RawRiskTabProps {
  scenario: RiskScenario;
}

const RawRiskTab: React.FC<RawRiskTabProps> = ({ scenario }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Impact brut</h4>
        <p className="text-xl font-semibold capitalize">
          {(scenario.rawImpact || scenario.raw_impact) === 'low' ? 'Faible' :
          (scenario.rawImpact || scenario.raw_impact) === 'medium' ? 'Moyen' :
          (scenario.rawImpact || scenario.raw_impact) === 'high' ? 'Élevé' : 'Critique'}
        </p>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Probabilité brute</h4>
        <p className="text-xl font-semibold capitalize">
          {(scenario.rawLikelihood || scenario.raw_likelihood) === 'low' ? 'Faible' :
          (scenario.rawLikelihood || scenario.raw_likelihood) === 'medium' ? 'Moyen' :
          (scenario.rawLikelihood || scenario.raw_likelihood) === 'high' ? 'Élevé' : 'Critique'}
        </p>
      </div>
      
      <div className="bg-background rounded-lg p-4 border">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">Niveau de risque brut</h4>
        <p className={`text-xl font-semibold capitalize ${
          (scenario.rawRiskLevel || scenario.raw_risk_level) === 'low' ? 'text-green-600 dark:text-green-400' :
          (scenario.rawRiskLevel || scenario.raw_risk_level) === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
          (scenario.rawRiskLevel || scenario.raw_risk_level) === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {(scenario.rawRiskLevel || scenario.raw_risk_level) === 'low' ? 'Faible' :
          (scenario.rawRiskLevel || scenario.raw_risk_level) === 'medium' ? 'Moyen' :
          (scenario.rawRiskLevel || scenario.raw_risk_level) === 'high' ? 'Élevé' : 'Critique'}
        </p>
      </div>
    </div>
  );
};

export default RawRiskTab;
