
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus } from 'lucide-react';
import { RiskScenario } from '@/types';
import { getRiskLevelBadge, getRiskScopeBadge, getRiskStatusBadge } from '@/components/risk-analysis/utils/riskBadges';

interface ScenariosTabProps {
  isLoading: boolean;
  riskScenarios: RiskScenario[];
  companyId: string;
}

const ScenariosTab = ({ isLoading, riskScenarios, companyId }: ScenariosTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Scénarios de risque</CardTitle>
          <CardDescription>Liste des scénarios de risque identifiés</CardDescription>
        </div>
        <Button asChild>
          <Link to={`/risk-analysis/new-scenario/${companyId}`}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau scénario
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {riskScenarios.length === 0 ? (
          <div className="text-center py-6">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              Aucun scénario de risque identifié
            </p>
            <Button asChild>
              <Link to={`/risk-analysis/new-scenario/${companyId}`}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un premier scénario
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scénario</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Portée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskScenarios.map(scenario => (
                <TableRow key={scenario.id}>
                  <TableCell className="font-medium">{scenario.name}</TableCell>
                  <TableCell>{getRiskLevelBadge(scenario.riskLevel)}</TableCell>
                  <TableCell>{getRiskScopeBadge(scenario.scope)}</TableCell>
                  <TableCell>{getRiskStatusBadge(scenario.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/risk-analysis/scenario/${scenario.id}`}>
                        Détails
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenariosTab;
