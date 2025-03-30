
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskScenario } from '@/types';
import RawRiskTab from './RawRiskTab';
import ResidualRiskTab from './ResidualRiskTab';

interface RiskAssessmentTabsProps {
  scenario: RiskScenario;
}

const RiskAssessmentTabs: React.FC<RiskAssessmentTabsProps> = ({ scenario }) => {
  return (
    <Tabs defaultValue="raw" className="mt-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="raw">Évaluation brute</TabsTrigger>
        <TabsTrigger value="residual">Évaluation résiduelle</TabsTrigger>
      </TabsList>
      
      <TabsContent value="raw" className="space-y-4 p-4 border rounded-md mt-2">
        <RawRiskTab scenario={scenario} />
      </TabsContent>
      
      <TabsContent value="residual" className="space-y-4 p-4 border rounded-md mt-2">
        <ResidualRiskTab scenario={scenario} />
      </TabsContent>
    </Tabs>
  );
};

export default RiskAssessmentTabs;
