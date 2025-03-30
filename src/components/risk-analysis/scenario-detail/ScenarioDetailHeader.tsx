
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RiskScenario } from '@/types';

interface ScenarioDetailHeaderProps {
  scenario: RiskScenario;
  onEdit: () => void;
  onDelete: () => void;
}

const ScenarioDetailHeader: React.FC<ScenarioDetailHeaderProps> = ({
  scenario,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/risk-analysis/${scenario?.companyId}`)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour à l'analyse
      </Button>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le scénario de risque sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ScenarioDetailHeader;
