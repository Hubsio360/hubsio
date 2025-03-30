
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ChevronRight } from 'lucide-react';
import { RiskLevel, RiskStatus, RiskScenario } from '@/types';
import { getRiskLevelBadge, getRiskStatusBadge } from '@/components/risk-analysis/utils/riskBadges';

interface OverviewTabProps {
  isLoading: boolean;
  riskScenarios: RiskScenario[];
  criticalScenarios: number;
  highScenarios: number;
  mediumScenarios: number;
  lowScenarios: number;
  onTabChange: (value: string) => void;
}

const OverviewTab = ({
  isLoading,
  riskScenarios,
  criticalScenarios,
  highScenarios,
  mediumScenarios,
  lowScenarios,
  onTabChange
}: OverviewTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Répartition des risques par niveau</CardTitle>
          <CardDescription>Aperçu de la criticité des risques identifiés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-md bg-red-50">
              <span className="text-2xl font-bold text-red-600">{criticalScenarios}</span>
              <span className="text-sm text-red-600">Critique</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md bg-orange-50">
              <span className="text-2xl font-bold text-orange-600">{highScenarios}</span>
              <span className="text-sm text-orange-600">Élevé</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md bg-yellow-50">
              <span className="text-2xl font-bold text-yellow-600">{mediumScenarios}</span>
              <span className="text-sm text-yellow-600">Moyen</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md bg-green-50">
              <span className="text-2xl font-bold text-green-600">{lowScenarios}</span>
              <span className="text-sm text-green-600">Faible</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risques prioritaires</CardTitle>
          <CardDescription>Scénarios de risque critiques et élevés</CardDescription>
        </CardHeader>
        <CardContent>
          {riskScenarios.filter(scenario => 
            scenario.riskLevel === 'critical' || scenario.riskLevel === 'high'
          ).length === 0 ? (
            <div className="text-center py-6">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Aucun risque critique ou élevé identifié
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scénario</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskScenarios
                  .filter(scenario => scenario.riskLevel === 'critical' || scenario.riskLevel === 'high')
                  .slice(0, 5)
                  .map(scenario => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-medium">{scenario.name}</TableCell>
                      <TableCell>{getRiskLevelBadge(scenario.riskLevel)}</TableCell>
                      <TableCell>{getRiskStatusBadge(scenario.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/risk-analysis/scenario/${scenario.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => onTabChange('scenarios')}>
            Voir tous les scénarios
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default OverviewTab;
