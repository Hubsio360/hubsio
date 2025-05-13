
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
import AuditDaysSelector from './AuditDaysSelector';
import { ThemeSelector } from './ThemeSelector';
import ThemeDurationSelector from './ThemeDurationSelector';
import { cn } from '@/lib/utils';

export interface PlanOptionsProps {
  auditId: string;
  frameworkId: string;
  startDate: Date;
  endDate: Date;
  selectedDays: string[];
  maxHoursPerDay: number;
  selectedTopicIds: string[];
  themeDurations: Record<string, number>;
  excludedThemeNames: string[];
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onSelectedDaysChange: (days: string[]) => void;
  onMaxHoursChange: (hours: number) => void;
  onTopicsChange: (topicIds: string[]) => void;
  onThemeDurationChange: (themeId: string, duration: number) => void;
}

export function PlanOptions({
  auditId,
  frameworkId,
  startDate,
  endDate,
  selectedDays,
  maxHoursPerDay,
  selectedTopicIds,
  themeDurations,
  excludedThemeNames,
  onStartDateChange,
  onEndDateChange,
  onSelectedDaysChange,
  onMaxHoursChange,
  onTopicsChange,
  onThemeDurationChange,
}: PlanOptionsProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  return (
    <TabsContent value="options" className="space-y-4">
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
                        onStartDateChange(date);
                        // If end date is before new start date, update it
                        if (endDate < date) {
                          onEndDateChange(date);
                        }
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
                        onEndDateChange(date);
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
              startDate={startDate}
              endDate={endDate}
              selectedDays={selectedDays}
              onSelectionChange={onSelectedDaysChange}
            />
          </div>

          {/* Max hours per day */}
          <div className="space-y-2">
            <Label htmlFor="maxHours">Nombre d'heures maximum par jour</Label>
            <Input
              id="maxHours"
              type="number"
              min="1"
              max="24"
              value={maxHoursPerDay}
              onChange={(e) => onMaxHoursChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Themes selection */}
          <div className="space-y-2">
            <Label>Thématiques à inclure dans le plan</Label>
            <ThemeSelector
              auditId={auditId}
              frameworkId={frameworkId}
              onSelectionChange={onTopicsChange}
              selectedThemeIds={selectedTopicIds}
              excludedThemeNames={excludedThemeNames}
            />
          </div>

          {/* Theme durations */}
          {selectedTopicIds.length > 0 && (
            <div className="space-y-2">
              <Label>Durée par thématique (en heures)</Label>
              <ScrollArea className="h-[200px] pr-4">
                <ThemeDurationSelector
                  selectedTopicIds={selectedTopicIds}
                  themeDurations={themeDurations}
                  onDurationChange={onThemeDurationChange}
                />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
