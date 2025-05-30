
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Plus, 
  ArrowDown, 
  ArrowUp, 
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { RiskScenario, RiskLevel } from '@/types';
import { getRiskLevelBadge, getRiskScopeBadge, getRiskStatusBadge } from '@/components/risk-analysis/utils/riskBadges';
import { useData } from '@/contexts/DataContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditRiskScenarioModalV2 } from './EditRiskScenarioModalV2';

interface ScenariosTabProps {
  isLoading: boolean;
  riskScenarios: RiskScenario[];
  companyId: string;
}

const ScenariosTab = ({ isLoading, riskScenarios, companyId }: ScenariosTabProps) => {
  const { updateRiskScenario, deleteRiskScenario, fetchRiskScenariosByCompanyId } = useData();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<RiskScenario | null>(null);
  const { toast } = useToast();

  // Helper function to show risk evolution (from raw to residual)
  const getRiskEvolution = (scenario: RiskScenario) => {
    if (!scenario.rawRiskLevel || !scenario.residualRiskLevel) {
      return null;
    }
    
    const riskLevels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const rawLevel = riskLevels[scenario.rawRiskLevel] || 0;
    const residualLevel = riskLevels[scenario.residualRiskLevel] || 0;
    
    if (rawLevel > residualLevel) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowDown className="h-4 w-4 mr-1" />
          {scenario.residualRiskLevel && getRiskLevelBadge(scenario.residualRiskLevel)}
        </div>
      );
    } else if (rawLevel < residualLevel) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowUp className="h-4 w-4 mr-1" />
          {scenario.residualRiskLevel && getRiskLevelBadge(scenario.residualRiskLevel)}
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          {scenario.residualRiskLevel && getRiskLevelBadge(scenario.residualRiskLevel)}
        </div>
      );
    }
  };

  const handleEditScenario = (scenario: RiskScenario) => {
    setSelectedScenario(scenario);
    setEditDialogOpen(true);
  };

  const handleDeleteScenario = (scenario: RiskScenario) => {
    setSelectedScenario(scenario);
    setDeleteDialogOpen(true);
  };

  const handleSaveScenario = async (updatedData: Partial<RiskScenario>) => {
    if (!selectedScenario) return false;
    
    try {
      await updateRiskScenario(selectedScenario.id, updatedData);
      await fetchRiskScenariosByCompanyId(companyId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du scénario:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le scénario de risque",
        variant: "destructive",
      });
      return false;
    }
  };

  const confirmDeleteScenario = async () => {
    if (!selectedScenario) return;
    
    try {
      const success = await deleteRiskScenario(selectedScenario.id);
      
      if (success) {
        await fetchRiskScenariosByCompanyId(companyId);
        setDeleteDialogOpen(false);
      } else {
        throw new Error("Échec de la suppression");
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du scénario:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le scénario de risque",
        variant: "destructive",
      });
    }
  };

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
    <>
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
                  <TableHead>Niveau brut</TableHead>
                  <TableHead>Niveau résiduel</TableHead>
                  <TableHead>Portée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskScenarios.map(scenario => (
                  <TableRow key={scenario.id}>
                    <TableCell className="font-medium">{scenario.name}</TableCell>
                    <TableCell>
                      {scenario.rawRiskLevel 
                        ? getRiskLevelBadge(scenario.rawRiskLevel) 
                        : getRiskLevelBadge(scenario.riskLevel)}
                    </TableCell>
                    <TableCell>
                      {getRiskEvolution(scenario) || 
                      (scenario.residualRiskLevel 
                        ? getRiskLevelBadge(scenario.residualRiskLevel) 
                        : 'Non évalué')}
                    </TableCell>
                    <TableCell>{getRiskScopeBadge(scenario.scope)}</TableCell>
                    <TableCell>{getRiskStatusBadge(scenario.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/risk-analysis/scenario/${scenario.id}`}>
                            Détails
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditScenario(scenario)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteScenario(scenario)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Remplacer l'ancien dialog par le nouveau */}
      {selectedScenario && (
        <EditRiskScenarioModalV2
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          scenario={selectedScenario}
          onSave={handleSaveScenario}
        />
      )}

      {/* Dialog de confirmation pour la suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le scénario de risque "{selectedScenario?.name}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteScenario}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ScenariosTab;
