
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseFormReturn } from 'react-hook-form';
import { Gauge } from 'lucide-react';
import { RiskScenarioFormValues } from './RiskScenarioForm';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import RawRiskAssessment from './RawRiskAssessment';
import ResidualRiskAssessment from './ResidualRiskAssessment';
import RiskAssessmentLoading from './RiskAssessmentLoading';

interface RiskAssessmentSectionProps {
  form: UseFormReturn<RiskScenarioFormValues>;
  companyId: string;
}

const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({ form, companyId }) => {
  const {
    loading,
    impactScales,
    likelihoodScale,
    activeImpactScale,
    setActiveImpactScale,
    impactScaleRatings,
    handleImpactScaleChange
  } = useRiskAssessment(form, companyId);

  // If no scales are available, show a loading message
  if ((loading && loading.companyRiskScales) || (!impactScales.length && !likelihoodScale)) {
    return <RiskAssessmentLoading />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="mr-2 h-5 w-5" />
            Évaluation du risque
          </CardTitle>
          <CardDescription>
            Évaluez les niveaux d'impact et de probabilité pour ce scénario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="raw" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw">Risque brut</TabsTrigger>
              <TabsTrigger value="residual">Risque résiduel</TabsTrigger>
            </TabsList>
            
            <TabsContent value="raw" className="space-y-6 pt-4">
              <RawRiskAssessment 
                form={form}
                likelihoodScale={likelihoodScale}
                impactScales={impactScales}
                activeImpactScale={activeImpactScale}
                setActiveImpactScale={setActiveImpactScale}
                impactScaleRatings={impactScaleRatings}
                handleImpactScaleChange={handleImpactScaleChange}
              />
            </TabsContent>
            
            <TabsContent value="residual" className="space-y-6 pt-4">
              <ResidualRiskAssessment 
                form={form}
                likelihoodScale={likelihoodScale}
                impactScales={impactScales}
                activeImpactScale={activeImpactScale}
                setActiveImpactScale={setActiveImpactScale}
                impactScaleRatings={impactScaleRatings}
                handleImpactScaleChange={handleImpactScaleChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessmentSection;
