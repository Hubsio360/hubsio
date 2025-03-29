
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
      <Card className="border-white/10 bg-black/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Gauge className="mr-2 h-6 w-6" />
            Évaluation du risque
          </CardTitle>
          <CardDescription className="text-gray-300">
            Évaluez les niveaux d'impact et de probabilité pour ce scénario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="raw" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 mb-6">
              <TabsTrigger value="raw" className="data-[state=active]:bg-primary">Risque brut</TabsTrigger>
              <TabsTrigger value="residual" className="data-[state=active]:bg-primary">Risque résiduel</TabsTrigger>
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
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessmentSection;
