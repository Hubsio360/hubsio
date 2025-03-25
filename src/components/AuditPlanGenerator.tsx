
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar } from 'lucide-react';
import PlanOptions from './audit-plan/PlanOptions';
import PlanActions from './audit-plan/PlanActions';
import { useAuditPlanGenerator } from '@/hooks/useAuditPlanGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface AuditPlanGeneratorProps {
  auditId: string;
  startDate: string;
  endDate: string;
  onPlanGenerated?: (targetTab?: string) => void;
}

export const AuditPlanGenerator: React.FC<AuditPlanGeneratorProps> = ({
  auditId,
  startDate,
  endDate,
  onPlanGenerated
}) => {
  const [selectedTab, setSelectedTab] = useState('options');
  
  const {
    selectedTopicIds,
    setSelectedTopicIds,
    selectedDays,
    setSelectedDays,
    themeDurations,
    generating,
    maxHoursPerDay,
    totalHours,
    totalInterviews,
    requiredDays,
    hasOpeningClosing,
    themes,
    systemThemeNames,
    handleThemeDurationChange,
    generatePlan,
    availableHoursPerDay,
    previewInterviews
  } = useAuditPlanGenerator({
    auditId,
    startDate,
    endDate,
    onPlanGenerated
  });

  return (
    <div className="space-y-8">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="options">
            <Clock className="h-4 w-4 mr-2" />
            Options de planification
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="options" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <PlanOptions 
              auditId={auditId}
              startDate={startDate}
              endDate={endDate}
              selectedTopicIds={selectedTopicIds}
              themes={themes}
              themeDurations={themeDurations}
              selectedDays={selectedDays}
              totalHours={totalHours}
              availableHoursPerDay={availableHoursPerDay}
              systemThemeNames={systemThemeNames}
              onTopicSelectionChange={setSelectedTopicIds}
              onDurationChange={handleThemeDurationChange}
              onSelectedDaysChange={setSelectedDays}
            />
            
            <div className="md:col-span-1">
              <PlanActions 
                generating={generating}
                selectedTopicIds={selectedTopicIds.filter(id => {
                  const theme = themes.find(t => t.id === id);
                  return theme && !systemThemeNames.includes(theme.name);
                })}
                selectedDays={selectedDays}
                businessDays={selectedDays.length}
                requiredDays={requiredDays}
                interviewsCount={totalInterviews}
                totalHours={totalHours}
                maxHoursPerDay={maxHoursPerDay}
                hasOpeningClosing={hasOpeningClosing}
                onGeneratePlan={generatePlan}
              />
              
              {selectedDays.length > 0 && selectedTopicIds.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium mb-4">Aperçu du planning</h3>
                    {previewInterviews.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {previewInterviews.map((interview, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="font-medium">{interview.title}</div>
                            <div className="text-sm text-muted-foreground flex justify-between mt-1">
                              <span>
                                {format(new Date(interview.startTime), 'dd/MM/yyyy HH:mm')}
                              </span>
                              <span>{interview.durationMinutes} min</span>
                            </div>
                            {interview.themeId && (
                              <div className="text-xs bg-primary/10 text-primary rounded px-2 py-1 mt-2 inline-block">
                                {themes.find(t => t.id === interview.themeId)?.name || interview.themeId}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-6 text-center py-8">
                        <p className="text-muted-foreground mb-2">
                          Sélectionnez des thématiques et des jours pour voir un aperçu du planning
                        </p>
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mt-4" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditPlanGenerator;
