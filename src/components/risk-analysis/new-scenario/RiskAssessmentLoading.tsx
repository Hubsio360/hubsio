
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

const RiskAssessmentLoading: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gauge className="mr-2 h-5 w-5" />
          Évaluation du risque
        </CardTitle>
        <CardDescription>
          Chargement des échelles de risque...
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default RiskAssessmentLoading;
