
import React from 'react';
import { useAuditPlanGenerator } from '@/hooks/useAuditPlanGenerator';
import { useData } from '@/contexts/DataContext';
import PlanOptions from './audit-plan/PlanOptions';
import PlanSummary from './audit-plan/PlanSummary';
import PlanActions from './audit-plan/PlanActions';
import AuditStatsSummary from './audit-plan/AuditStatsSummary';

interface AuditPlanGeneratorProps {
  auditId: string;
  frameworkId?: string; // Add frameworkId
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
  const { themes } = useData();
  
  const {
    selectedTopicIds,
    setSelectedTopicIds,
    selectedDays,
    setSelectedDays,
    themeDurations,
    generating,
    existingInterviews,
    existingThemes,
    maxHoursPerDay,
    totalHours,
    totalInterviews,
    requiredDays,
    hasOpeningClosing,
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

  const handleGeneratePlan = () => {
    generatePlan();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PlanOptions
        auditId={auditId}
        frameworkId={frameworkId}
        startDate={startDate}
        endDate={endDate}
        selectedTopicIds={selectedTopicIds}
        themes={themes}
        themeDurations={themeDurations}
        selectedDays={selectedDays}
        totalHours={totalHours}
        availableHoursPerDay={availableHoursPerDay}
        onTopicSelectionChange={setSelectedTopicIds}
        onDurationChange={handleThemeDurationChange}
        onSelectedDaysChange={setSelectedDays}
      />

      <div className="md:col-span-1 space-y-6">
        <AuditStatsSummary
          totalHours={totalHours}
          totalInterviews={totalInterviews}
          requiredDays={requiredDays}
          selectedDays={selectedDays.length}
          existingInterviews={existingInterviews}
          existingThemes={existingThemes}
          hasOpeningClosing={hasOpeningClosing}
        />
        
        <PlanSummary
          previewInterviews={previewInterviews}
          loading={generating}
        />
        
        <PlanActions
          onGeneratePlan={handleGeneratePlan}
          disabled={selectedTopicIds.length === 0 || selectedDays.length === 0 || generating}
          loading={generating}
          hasEnoughDays={selectedDays.length >= requiredDays}
          requiredDays={requiredDays}
        />
      </div>
    </div>
  );
};

export default AuditPlanGenerator;
