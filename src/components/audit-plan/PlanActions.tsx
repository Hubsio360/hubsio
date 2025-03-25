
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckIcon, Loader2 } from 'lucide-react';

interface PlanActionsProps {
  generating: boolean;
  selectedTopicIds: string[];
  selectedDays: string[];
  businessDays: number;
  requiredDays: number;
  interviewsCount: number;
  totalHours: number;
  maxHoursPerDay: number;
  hasOpeningClosing: boolean;
  onGeneratePlan: () => void;
}

const PlanActions: React.FC<PlanActionsProps> = ({
  generating,
  selectedTopicIds,
  selectedDays,
  businessDays,
  requiredDays,
  interviewsCount,
  totalHours,
  maxHoursPerDay,
  hasOpeningClosing,
  onGeneratePlan
}) => {
  return (
    <Card className="sticky top-4">
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">État du plan</div>
            <div className={`text-xs px-2 py-1 rounded-full ${businessDays >= requiredDays ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {businessDays >= requiredDays ? 'Valide' : 'Incomplet'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {businessDays < requiredDays 
              ? `Il vous manque ${requiredDays - businessDays} jour(s) pour couvrir toutes les thématiques sélectionnées.`
              : "Toutes les thématiques peuvent être couvertes dans les jours sélectionnés."}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onGeneratePlan} 
          disabled={
            generating || 
            selectedTopicIds.length === 0 || 
            selectedDays.length === 0 ||
            selectedDays.length < requiredDays
          }
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
