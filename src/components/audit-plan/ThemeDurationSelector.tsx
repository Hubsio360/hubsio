
import React from 'react';
import { Input } from '@/components/ui/input';
import { AuditTheme } from '@/types';

export interface ThemeDurationSelectorProps {
  themes: AuditTheme[];
  themeDurations: Record<string, number>;
  onDurationChange: (themeId: string, duration: number) => void;
  excludedThemeNames: string[];
}

const ThemeDurationSelector: React.FC<ThemeDurationSelectorProps> = ({
  themes,
  themeDurations,
  onDurationChange,
  excludedThemeNames
}) => {
  return (
    <div className="space-y-4">
      {themes
        .filter(theme => !excludedThemeNames.includes(theme.name))
        .map(theme => (
          <div key={theme.id} className="flex items-center justify-between">
            <div className="font-medium">{theme.name}</div>
            <div className="w-24">
              <Input
                type="number"
                min="1"
                max="8"
                value={themeDurations[theme.id] || 1}
                onChange={(e) => onDurationChange(theme.id, Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                className="text-right"
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default ThemeDurationSelector;
