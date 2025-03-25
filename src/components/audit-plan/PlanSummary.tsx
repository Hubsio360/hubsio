
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PlanSummaryProps {
  businessDays: number;
  requiredDays: number;
  topicsCount: number;
  interviewsCount: number;
  totalHours: number;
  maxHoursPerDay: number;
  hasOpeningClosing: boolean;
}

const PlanSummary: React.FC<PlanSummaryProps> = ({
  businessDays,
  requiredDays,
  topicsCount,
  interviewsCount,
  totalHours,
  maxHoursPerDay,
  hasOpeningClosing
}) => {
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
          <span>Thématiques</span>
          <span className="font-medium">{topicsCount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Entretiens prévus</span>
          <span className="font-medium">{interviewsCount}</span>
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
