
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { addDays, isWeekend, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fr } from 'date-fns/locale';
import AuditDaysSelector from '../AuditDaysSelector';
import { ThemeSelector } from './ThemeSelector';
import ThemeDurationSelector from './ThemeDurationSelector';
import { cn } from '@/lib/utils';
import { AuditTheme } from '@/types';

export interface PlanOptionsProps {
  auditId: string;
  frameworkId: string;
  startDate: Date;
  endDate: Date;
  selectedDays: string[];
  selectedTopicIds: string[];
  themeDurations: Record<string, number>;
  themes: AuditTheme[];
  totalHours: number;
  availableHoursPerDay: number;
  systemThemeNames: string[];
  onTopicSelectionChange: (topicIds: string[]) => void;
  onDurationChange: (themeId: string, duration: number) => void;
  onSelectedDaysChange: (days: string[]) => void;
}

export function PlanOptions({
  auditId,
  frameworkId,
  startDate,
  endDate,
  selectedDays,
  selectedTopicIds,
  themeDurations,
  themes,
  totalHours,
  availableHoursPerDay,
  systemThemeNames,
  onTopicSelectionChange,
  onDurationChange,
  onSelectedDaysChange,
}: PlanOptionsProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Convert Date objects to string for the AuditDaysSelector
  const stringifyDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Options du plan d'audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date range selection */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setIsStartOpen(false);
                      if (date) {
                        // Handle date selection through props if needed
                        // Currently using controlled component from parent
                      }
                    }}
                    locale={fr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setIsEndOpen(false);
                      if (date && date >= startDate) {
                        // Handle date selection through props if needed
                        // Currently using controlled component from parent
                      }
                    }}
                    fromDate={startDate}
                    locale={fr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Days selection */}
          <div className="space-y-2">
            <Label>Jours d'audit</Label>
            <AuditDaysSelector
              startDate={stringifyDate(startDate)}
              endDate={stringifyDate(endDate)}
              selectedDays={selectedDays}
              onSelectedDaysChange={onSelectedDaysChange}
              requiredHours={totalHours}
              availableHoursPerDay={availableHoursPerDay}
            />
          </div>

          <Separator />

          {/* Themes selection */}
          <div className="space-y-2">
            <Label>Thématiques à inclure dans le plan</Label>
            <ThemeSelector
              auditId={auditId}
              frameworkId={frameworkId}
              onSelectionChange={onTopicSelectionChange}
              selectedThemeIds={selectedTopicIds}
              excludedThemeNames={systemThemeNames}
            />
          </div>

          {/* Theme durations */}
          {selectedTopicIds.length > 0 && (
            <div className="space-y-2">
              <Label>Durée par thématique (en heures)</Label>
              <ScrollArea className="h-[200px] pr-4">
                <ThemeDurationSelector
                  themes={themes.filter(theme => selectedTopicIds.includes(theme.id))}
                  themeDurations={themeDurations}
                  onDurationChange={onDurationChange}
                  excludedThemeNames={systemThemeNames}
                />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
