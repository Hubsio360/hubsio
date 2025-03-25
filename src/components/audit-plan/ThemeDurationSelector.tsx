
import React from 'react';
import { AuditTheme } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThemeDurationSelectorProps {
  themes: AuditTheme[];
  themeDurations: Record<string, number>;
  onDurationChange: (themeId: string, duration: number) => void;
}

const ThemeDurationSelector: React.FC<ThemeDurationSelectorProps> = ({
  themes,
  themeDurations,
  onDurationChange
}) => {
  if (!themes || themes.length === 0) {
    return <div className="text-muted-foreground">Aucune thématique disponible</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Durée des interviews par thématique</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {themes.map((theme) => (
            <div key={theme.id} className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor={`theme-duration-${theme.id}`} className="font-medium">
                  {theme.name}
                </Label>
                <Select
                  value={String(themeDurations[theme.id] || 60)}
                  onValueChange={(value) => onDurationChange(theme.id, parseInt(value))}
                >
                  <SelectTrigger id={`theme-duration-${theme.id}`} className="w-[160px]">
                    <SelectValue placeholder="Durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">2 heures</SelectItem>
                    <SelectItem value="180">3 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {theme.description && (
                <p className="text-sm text-muted-foreground">{theme.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeDurationSelector;
