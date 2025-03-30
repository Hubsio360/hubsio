
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { RiskScenario } from '@/types';

interface ScenarioCardHeaderProps {
  scenario: RiskScenario;
}

const ScenarioCardHeader: React.FC<ScenarioCardHeaderProps> = ({ scenario }) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl">{scenario.name}</CardTitle>
          <CardDescription>
            Scénario de risque - ID: {scenario.id}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="capitalize">
            {scenario.scope}
          </Badge>
          <Badge 
            variant={
              scenario.riskLevel === 'low' ? 'secondary' :
              scenario.riskLevel === 'medium' ? 'outline' :
              scenario.riskLevel === 'high' ? 'default' : 'destructive'
            }
          >
            {scenario.riskLevel === 'low' ? 'Faible' :
            scenario.riskLevel === 'medium' ? 'Moyen' :
            scenario.riskLevel === 'high' ? 'Élevé' : 'Critique'}
          </Badge>
          <Badge 
            variant="outline" 
            className="capitalize"
          >
            {scenario.status === 'identified' ? 'Identifié' :
            scenario.status === 'analyzed' ? 'Analysé' :
            scenario.status === 'treated' ? 'Traité' :
            scenario.status === 'accepted' ? 'Accepté' : 'Surveillé'}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};

export default ScenarioCardHeader;
