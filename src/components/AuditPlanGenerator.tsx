
import React from 'react';
import { useAuditPlanGenerator } from '@/hooks/useAuditPlanGenerator';
import { useData } from '@/contexts/DataContext';
import PlanOptions from './audit-plan/PlanOptions';
import PlanSummary from './audit-plan/PlanSummary';
import PlanActions from './audit-plan/PlanActions';
import AuditStatsSummary from './audit-plan/AuditStatsSummary';

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
          businessDays={selectedDays.length}
          topicsCount={selectedTopicIds.length}
          interviewsCount={totalInterviews}
        />
        
        <PlanSummary
          businessDays={selectedDays.length}
          requiredDays={requiredDays}
          topicsCount={selectedTopicIds.length}
          interviewsCount={totalInterviews}
          totalHours={totalHours}
          maxHoursPerDay={maxHoursPerDay}
          hasOpeningClosing={hasOpeningClosing}
        />
        
        <PlanActions
          generating={generating}
          selectedTopicIds={selectedTopicIds}
          selectedDays={selectedDays}
          businessDays={selectedDays.length}
          requiredDays={requiredDays}
          interviewsCount={totalInterviews}
          totalHours={totalHours}
          maxHoursPerDay={maxHoursPerDay}
          hasOpeningClosing={hasOpeningClosing}
          onGeneratePlan={handleGeneratePlan}
        />
      </div>
    </div>
  );
};

export default AuditPlanGenerator;
