
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from "@/components/ui/progress";
import { RiskScaleLevel } from '@/types/risk-scales';
import { RiskLevel } from '@/types';

interface RiskScaleSliderProps {
  levels: RiskScaleLevel[];
  value: RiskLevel;
  onChange: (value: RiskLevel) => void;
  name: string;
  label: string;
  description?: string;
}

const RiskScaleSlider: React.FC<RiskScaleSliderProps> = ({
  levels,
  value,
  onChange,
  name,
  label,
  description
}) => {
  const [sliderValue, setSliderValue] = useState<number>(0);
  
  // Sort levels by level_value
  const sortedLevels = [...levels].sort((a, b) => 
    (a.levelValue || 0) - (b.levelValue || 0)
  );
  
  // Map risk level (low, medium, etc.) to slider position
  useEffect(() => {
    const levelIndex = sortedLevels.findIndex(level => {
      // First try to find by name (case insensitive)
      if (level.name.toLowerCase() === value.toLowerCase()) {
        return true;
      }
      
      // Then try to match by approximate mapping
      if (value === 'low' && (level.levelValue === 1 || level.name.toLowerCase().includes('faibl'))) {
        return true;
      }
      if (value === 'medium' && (level.levelValue === 2 || level.name.toLowerCase().includes('moyen') || level.name.toLowerCase().includes('modér'))) {
        return true;
      }
      if (value === 'high' && (level.levelValue === 3 || level.name.toLowerCase().includes('élev') || level.name.toLowerCase().includes('haut'))) {
        return true;
      }
      if (value === 'critical' && (level.levelValue === 4 || level.name.toLowerCase().includes('critique') || level.name.toLowerCase().includes('critic'))) {
        return true;
      }
      
      return false;
    });
    
    setSliderValue(levelIndex >= 0 ? levelIndex : 0);
  }, [value, sortedLevels]);
  
  // Map slider position to risk level
  const handleSliderChange = (newValue: number[]) => {
    const position = newValue[0];
    setSliderValue(position);
    
    if (sortedLevels[position]) {
      // Map back to standard risk level based on position
      let riskLevel: RiskLevel = 'low';
      
      if (position === 0) riskLevel = 'low';
      else if (position === sortedLevels.length - 1) riskLevel = 'critical';
      else if (position === Math.floor(sortedLevels.length / 2)) riskLevel = 'medium';
      else if (position > Math.floor(sortedLevels.length / 2)) riskLevel = 'high';
      
      // Override with more accurate mapping if possible
      const levelName = sortedLevels[position].name.toLowerCase();
      if (levelName.includes('faibl')) riskLevel = 'low';
      else if (levelName.includes('moyen') || levelName.includes('modér')) riskLevel = 'medium';
      else if (levelName.includes('élev') || levelName.includes('haut')) riskLevel = 'high';
      else if (levelName.includes('critique') || levelName.includes('critic')) riskLevel = 'critical';
      
      onChange(riskLevel);
    }
  };
  
  if (!sortedLevels.length) {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormDescription>
          Échelle de risque non configurée. Veuillez configurer les échelles de risque.
        </FormDescription>
      </FormItem>
    );
  }
  
  // Get current level from slider value
  const currentLevel = sortedLevels[sliderValue];
  
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {currentLevel?.name || 'Niveau non défini'}
          </span>
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: currentLevel?.color || '#e2e8f0',
              color: getContrastColor(currentLevel?.color || '#e2e8f0')
            }}
          >
            {currentLevel?.description || 'Description non disponible'}
          </span>
        </div>
        
        <FormControl>
          <Slider
            value={[sliderValue]}
            max={sortedLevels.length - 1}
            step={1}
            onValueChange={handleSliderChange}
            className="py-4"
          />
        </FormControl>
        
        <div className="flex justify-between mt-1">
          {sortedLevels.map((level, index) => (
            <div 
              key={level.id} 
              className="flex flex-col items-center cursor-pointer" 
              style={{ width: `${100 / sortedLevels.length}%` }}
              onClick={() => handleSliderChange([index])}
            >
              <div 
                className="w-3 h-3 rounded-full mb-1" 
                style={{ backgroundColor: level.color || '#e2e8f0' }} 
              />
              <span className="text-xs text-center truncate w-full" title={level.name}>
                {level.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
};

// Helper function to determine if text should be white or black based on background color
function getContrastColor(hexColor: string): string {
  // Default to black if invalid color
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance - if light background use dark text, if dark background use light text
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default RiskScaleSlider;
