
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RiskScenario } from '@/types';
import ScenarioCardHeader from './ScenarioCardHeader';
import ScenarioDescription from './ScenarioDescription';
import ImpactDescriptionSection from './ImpactDescriptionSection';
import RiskLevelCards from './RiskLevelCards';
import RiskAssessmentTabs from './RiskAssessmentTabs';

interface ScenarioDetailContentProps {
  scenario: RiskScenario;
  isGenerating: boolean;
  onGenerateImpact: () => void;
}

const ScenarioDetailContent: React.FC<ScenarioDetailContentProps> = ({
  scenario,
  isGenerating,
  onGenerateImpact
}) => {
  return (
    <Card>
      <ScenarioCardHeader scenario={scenario} />
      
      <CardContent className="space-y-6">
        <ScenarioDescription description={scenario.description} />
        
        <ImpactDescriptionSection 
          scenario={scenario}
          isGenerating={isGenerating}
          onGenerateImpact={onGenerateImpact}
        />
        
        <RiskLevelCards scenario={scenario} />
        
        <RiskAssessmentTabs scenario={scenario} />
      </CardContent>
    </Card>
  );
};

export default ScenarioDetailContent;
