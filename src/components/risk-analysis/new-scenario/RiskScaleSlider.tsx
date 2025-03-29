
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RiskScaleLevel } from '@/types/risk-scales';
import { RiskLevel } from '@/types';
import RiskLevelIndicator from './RiskLevelIndicator';
import SliderLabels from './SliderLabels';
import { mapPositionToRiskLevel, mapRiskLevelToIndex } from './riskLevelMapper';

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
    (a.levelValue || a.level_value || 0) - (b.levelValue || b.level_value || 0)
  );
  
  // Map risk level to slider position
  useEffect(() => {
    const index = mapRiskLevelToIndex(value, sortedLevels);
    setSliderValue(index);
  }, [value, sortedLevels]);
  
  // Handle slider value change
  const handleSliderChange = (newValue: number[]) => {
    const position = Math.round(newValue[0]); // Ensure the position is an integer
    
    if (position !== sliderValue && sortedLevels[position]) {
      setSliderValue(position);
      const riskLevel = mapPositionToRiskLevel(position, sortedLevels);
      onChange(riskLevel);
    }
  };
  
  // Get current level from slider value
  const currentLevel = sortedLevels[sliderValue];
  
  if (!sortedLevels || !sortedLevels.length) {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormDescription>
          Échelle de risque non configurée. Veuillez configurer les échelles de risque.
        </FormDescription>
      </FormItem>
    );
  }
  
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      
      <div className="space-y-6 pt-1">
        <FormControl>
          <div className="relative pt-2">
            {/* Slider component with larger clickable area */}
            <Slider
              value={[sliderValue]}
              max={sortedLevels.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="my-6 h-4"
              data-testid={`${name}-slider`}
              aria-label={label}
            />
            
            {/* Labels under the slider */}
            <SliderLabels levels={sortedLevels} selectedIndex={sliderValue} />
          </div>
        </FormControl>
        
        {/* Description of selected level shown below the slider */}
        <div className="mt-2">
          <RiskLevelIndicator level={currentLevel} />
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default RiskScaleSlider;
