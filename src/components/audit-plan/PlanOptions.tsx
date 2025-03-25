
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AuditTheme } from '@/types';
import ThemeSelector from './ThemeSelector';
import ThemeDurationSelector from './ThemeDurationSelector';
import AuditDaysSelector from './AuditDaysSelector';

interface PlanOptionsProps {
  auditId: string;
  startDate: string;
  endDate: string;
  selectedTopicIds: string[];
  themes: AuditTheme[];
  themeDurations: Record<string, number>;
  selectedDays: string[];
  totalHours: number;
  systemThemeNames?: string[];
  onTopicSelectionChange: (topicIds: string[]) => void;
  onDurationChange: (themeId: string, duration: number) => void;
  onSelectedDaysChange: (days: string[]) => void;
}

const PlanOptions: React.FC<PlanOptionsProps> = ({
  auditId,
  startDate,
  endDate,
  selectedTopicIds,
  themes,
  themeDurations,
  selectedDays,
  totalHours,
  systemThemeNames = ['ADMIN', 'Cloture'],
  onTopicSelectionChange,
  onDurationChange,
  onSelectedDaysChange
}) => {
  return (
    <div className="md:col-span-2 space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ce module va automatiquement générer un plan d'audit incluant des entretiens pour chaque thématique sélectionnée.
          Une réunion d'ouverture et de clôture seront automatiquement incluses.
        </AlertDescription>
      </Alert>
      
      <ThemeSelector 
        auditId={auditId}
        selectedTopicIds={selectedTopicIds}
        onSelectionChange={onTopicSelectionChange}
        excludedThemeNames={systemThemeNames}
      />
      
      {selectedTopicIds.length > 0 && themes.length > 0 && (
        <ThemeDurationSelector
          themes={themes}
          themeDurations={themeDurations}
          onDurationChange={onDurationChange}
          excludedThemeNames={systemThemeNames}
        />
      )}
      
      <AuditDaysSelector
        startDate={startDate}
        endDate={endDate}
        selectedDays={selectedDays}
        onSelectedDaysChange={onSelectedDaysChange}
        requiredHours={totalHours}
        availableHoursPerDay={6.5} // 8 hour day minus 1.5 hour lunch break
      />
    </div>
  );
};

export default PlanOptions;
