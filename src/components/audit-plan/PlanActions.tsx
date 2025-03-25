
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckIcon, Loader2 } from 'lucide-react';
import PlanSummary from './PlanSummary';

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
      <CardContent>
        <PlanSummary 
          businessDays={businessDays}
          requiredDays={requiredDays}
          topicsCount={selectedTopicIds.length}
          interviewsCount={interviewsCount}
          totalHours={totalHours}
          maxHoursPerDay={maxHoursPerDay}
          hasOpeningClosing={hasOpeningClosing}
        />
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
