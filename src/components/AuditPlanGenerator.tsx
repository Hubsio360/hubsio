
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';
import PlanOptions from './audit-plan/PlanOptions';
import PlanActions from './audit-plan/PlanActions';
import { useAuditPlanGenerator } from '@/hooks/useAuditPlanGenerator';

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
    generatePlan
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
              systemThemeNames={systemThemeNames}
              onTopicSelectionChange={setSelectedTopicIds}
              onDurationChange={handleThemeDurationChange}
              onSelectedDaysChange={setSelectedDays}
            />
            
            <div>
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditPlanGenerator;
