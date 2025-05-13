
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { addDays, format, isWeekend, parse } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { fr } from 'date-fns/locale';

interface AuditDaysSelectorProps {
  startDate: string;  // Format 'yyyy-MM-dd'
  endDate: string;    // Format 'yyyy-MM-dd'
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
  availableHoursPerDay,
}) => {
  // Parse date strings to Date objects
  const startDateObj = parse(startDate, 'yyyy-MM-dd', new Date());
  const endDateObj = parse(endDate, 'yyyy-MM-dd', new Date());
  
  // Generate array of dates between start and end
  const generateDateRange = () => {
    const dates = [];
    let currentDate = startDateObj;
    
    while (currentDate <= endDateObj) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  };
  
  const dateRange = generateDateRange();
  
  // Calculate how many days we need based on required hours
  const requiredDays = Math.ceil(requiredHours / availableHoursPerDay);
  
  // Toggle day selection
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onSelectedDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onSelectedDaysChange([...selectedDays, day]);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Sélectionnez les jours d'audit ({selectedDays.length} sur {requiredDays} jours nécessaires)
        </span>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const workingDays = dateRange.filter(date => {
              const dateObj = parse(date, 'yyyy-MM-dd', new Date());
              return !isWeekend(dateObj);
            }).slice(0, requiredDays);
            
            onSelectedDaysChange(workingDays);
          }}
        >
          Sélection automatique
        </Button>
      </div>
      
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {dateRange.map(day => {
            const dateObj = parse(day, 'yyyy-MM-dd', new Date());
            const isWeekendDay = isWeekend(dateObj);
            
            return (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                className={`justify-start ${isWeekendDay ? 'opacity-50' : ''}`}
                onClick={() => toggleDay(day)}
                size="sm"
              >
                <div className="flex flex-col items-start">
                  <span>{format(dateObj, 'EEEE', { locale: fr })}</span>
                  <span className="text-xs">{format(dateObj, 'dd/MM', { locale: fr })}</span>
                </div>
                {isWeekendDay && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Weekend
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AuditDaysSelector;
