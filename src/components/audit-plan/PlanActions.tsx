
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckIcon, Loader2 } from 'lucide-react';

interface PlanActionsProps {
  generating: boolean;
  isValid: boolean;
  totalInterviews: number;
  requiredDays: number;
  selectedDays: number;
  onGeneratePlan: () => void;
}

const PlanActions: React.FC<PlanActionsProps> = ({
  generating,
  isValid,
  totalInterviews,
  requiredDays,
  selectedDays,
  onGeneratePlan
}) => {
  return (
    <Card className="sticky top-4">
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">État du plan</div>
            <div className={`text-xs px-2 py-1 rounded-full ${selectedDays >= requiredDays ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {selectedDays >= requiredDays ? 'Valide' : 'Incomplet'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedDays < requiredDays 
              ? `Il vous manque ${requiredDays - selectedDays} jour(s) pour couvrir toutes les thématiques sélectionnées.`
              : "Toutes les thématiques peuvent être couvertes dans les jours sélectionnés."}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onGeneratePlan} 
          disabled={generating || !isValid}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Générer le plan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanActions;
