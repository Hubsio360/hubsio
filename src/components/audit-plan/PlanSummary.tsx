
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AuditTheme } from '@/types';

interface PlanSummaryProps {
  selectedTopicIds: string[];
  themes: AuditTheme[];
  themeDurations: Record<string, number>;
  selectedDays: string[];
  totalHours: number;
  totalInterviews: number;
  requiredDays: number;
  availableHoursPerDay: number;
  previewInterviews: Partial<any>[];
}

const PlanSummary: React.FC<PlanSummaryProps> = ({
  selectedTopicIds,
  themes,
  selectedDays,
  totalHours,
  totalInterviews,
  requiredDays,
  availableHoursPerDay,
  previewInterviews
}) => {
  // Calculate the number of business days
  const businessDays = selectedDays.length;
  const topicsCount = selectedTopicIds.length;
  const hasOpeningClosing = true;
  const isValid = businessDays >= requiredDays && topicsCount > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Résumé du plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>Jours sélectionnés</span>
          </div>
          <span className="font-medium">{businessDays} jour(s)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Heures d'interview</span>
          </div>
          <span className="font-medium">{totalHours} heure(s)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Jours requis</span>
          </div>
          <span className={`font-medium ${businessDays < requiredDays ? "text-destructive" : ""}`}>
            {requiredDays} jour(s)
          </span>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <span>Thématiques à auditer</span>
          <span className="font-medium">{topicsCount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Entretiens thématiques</span>
          <span className="font-medium">{topicsCount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Total entretiens</span>
          <span className="font-medium">{totalInterviews}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Réunions ouverture/clôture</span>
          <span className="font-medium">{hasOpeningClosing ? "Incluses" : "Non incluses"}</span>
        </div>
        
        <Separator />
        
        <div className="flex items-start gap-2 rounded-md p-3 bg-muted/50">
          {isValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isValid ? "Plan d'audit valide" : "Plan d'audit incomplet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isValid 
                ? "Toutes les thématiques peuvent être couvertes dans les jours sélectionnés."
                : businessDays < requiredDays 
                  ? `Il vous manque ${requiredDays - businessDays} jour(s) pour couvrir toutes les thématiques.`
                  : "Veuillez sélectionner au moins une thématique."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanSummary;
