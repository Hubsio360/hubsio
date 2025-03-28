
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RiskSummaryCardsProps {
  totalScenarios: number;
  criticalScenarios: number;
  nonTreatedScenarios: number;
  treatmentRate: number;
}

const RiskSummaryCards = ({
  totalScenarios,
  criticalScenarios,
  nonTreatedScenarios,
  treatmentRate
}: RiskSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalScenarios}</div>
          <p className="text-muted-foreground text-sm">Scénarios de risque</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-red-600">Critiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{criticalScenarios}</div>
          <p className="text-muted-foreground text-sm">Scénarios critiques</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-amber-600">Non traités</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">{nonTreatedScenarios}</div>
          <p className="text-muted-foreground text-sm">Scénarios à traiter</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-green-600">Taux de traitement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{treatmentRate}%</div>
          <p className="text-muted-foreground text-sm">Risques traités</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskSummaryCards;
