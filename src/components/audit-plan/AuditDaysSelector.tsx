
import React, { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, isBefore, isAfter, isSameDay, parseISO } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuditDaysSelectorProps {
  startDate: string;
  endDate: string;
  selectedDays: string[];
  onSelectedDaysChange: (days: string[]) => void;
  requiredHours: number;
  availableHoursPerDay: number;
}

const AuditDaysSelector: React.FC<AuditDaysSelectorProps> = ({
  startDate,
  endDate,
  selectedDays,
  onSelectedDaysChange,
  requiredHours,
  availableHoursPerDay
}) => {
  const auditStart = useMemo(() => parseISO(startDate), [startDate]);
  const auditEnd = useMemo(() => parseISO(endDate), [endDate]);
  
  const requiredDays = useMemo(() => {
    return Math.ceil(requiredHours / availableHoursPerDay);
  }, [requiredHours, availableHoursPerDay]);
  
  const needsMoreDays = selectedDays.length < requiredDays;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Jours d'audit</CardTitle>
        <CardDescription>
          Sélectionnez les jours pendant lesquels vous souhaitez planifier des entretiens
          (période d'audit: {format(auditStart, 'dd/MM/yyyy', { locale: fr })} - {format(auditEnd, 'dd/MM/yyyy', { locale: fr })})
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 space-y-4">
        {needsMoreDays && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {selectedDays.length === 0 ? (
                `Vous devez sélectionner au moins ${requiredDays} jour(s) pour couvrir toutes les thématiques (${requiredHours} heures d'interviews).`
              ) : (
                `Vous avez sélectionné ${selectedDays.length} jour(s), mais il vous en faut au moins ${requiredDays} pour couvrir les ${requiredHours} heures d'interviews prévues.`
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-wrap gap-2">
          {selectedDays.map(day => (
            <Badge 
              key={day}
              variant="outline"
              className="flex items-center px-3 py-1 text-sm"
            >
              <span>{format(new Date(day), 'EEEE dd MMMM', { locale: fr })}</span>
              <button
                className="ml-2 text-muted-foreground hover:text-destructive"
                onClick={() => onSelectedDaysChange(selectedDays.filter(d => d !== day))}
              >
                &times;
              </button>
            </Badge>
          ))}
        </div>
        
        <div className="border rounded-md p-3">
          <Calendar
            mode="multiple"
            selected={selectedDays.map(day => new Date(day))}
            onSelect={(days) => {
              if (!days) return;
              onSelectedDaysChange(days.map(day => day.toISOString()));
            }}
            className="mx-auto pointer-events-auto"
            locale={fr}
            fromDate={auditStart}
            toDate={auditEnd}
            disabled={(date) => {
              // Disable days outside audit range
              return isBefore(date, auditStart) || isAfter(date, auditEnd);
            }}
          />
        </div>
        
        <div className="text-sm flex justify-between text-muted-foreground">
          <div>Jours sélectionnés: {selectedDays.length}</div>
          <div>Jours requis: {requiredDays}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditDaysSelector;
