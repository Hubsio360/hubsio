
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlanOptions } from './audit-plan/PlanOptions';
import PlanSummary from './audit-plan/PlanSummary';
import PlanActions from './audit-plan/PlanActions';
import { useAuditPlanGenerator } from '@/hooks/useAuditPlanGenerator';
import { useToast } from '@/hooks/use-toast';

interface AuditPlanGeneratorProps {
  auditId: string;
  frameworkId?: string;
  startDate: string;
  endDate: string;
  onPlanGenerated?: (targetTab?: string) => void;
}

const AuditPlanGenerator: React.FC<AuditPlanGeneratorProps> = ({
  auditId,
  frameworkId,
  startDate,
  endDate,
  onPlanGenerated
}) => {
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  
  const {
    selectedTopicIds,
    setSelectedTopicIds,
    selectedDays,
    setSelectedDays,
    themeDurations,
    generating,
    totalHours,
    totalInterviews,
    requiredDays,
    themes,
    systemThemeNames,
    handleThemeDurationChange,
    generatePlan,
    availableHoursPerDay,
    previewInterviews
  } = useAuditPlanGenerator({
    auditId,
    frameworkId,
    startDate,
    endDate,
    onPlanGenerated
  });

  useEffect(() => {
    // Debug pour vérifier le chargement des données
    console.log("AuditPlanGenerator - Data Status:", {
      themesLoaded: themes.length > 0,
      themeCount: themes.length,
      selectedTopics: selectedTopicIds.length,
      selectedDays: selectedDays.length,
      themeDurations: Object.keys(themeDurations).length,
    });
    
    if (themes.length > 0 && !loaded) {
      setLoaded(true);
      
      // Notification en cas de succès du chargement
      if (themes.length > 0) {
        toast({
          title: "Thématiques chargées",
          description: `${themes.length} thématiques disponibles pour votre plan d'audit.`
        });
      }
    }
  }, [themes, selectedTopicIds, selectedDays, themeDurations, loaded, toast]);

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanOptions
            auditId={auditId}
            frameworkId={frameworkId || ''}
            startDate={new Date(startDate)}
            endDate={new Date(endDate)}
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
          
          <div className="md:col-span-1 space-y-6">
            <PlanSummary
              selectedTopicIds={selectedTopicIds}
              themes={themes}
              themeDurations={themeDurations}
              selectedDays={selectedDays}
              totalHours={totalHours}
              totalInterviews={totalInterviews}
              requiredDays={requiredDays}
              availableHoursPerDay={availableHoursPerDay}
              previewInterviews={previewInterviews}
            />
            
            <PlanActions
              onGeneratePlan={generatePlan}
              generating={generating}
              isValid={
                selectedTopicIds.length > 0 &&
                selectedDays.length >= requiredDays
              }
              totalInterviews={totalInterviews}
              requiredDays={requiredDays}
              selectedDays={selectedDays.length}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditPlanGenerator;
