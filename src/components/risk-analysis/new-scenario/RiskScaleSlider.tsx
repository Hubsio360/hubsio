
import React, { useState, useEffect, useCallback } from 'react';
import { Slider } from "@/components/ui/slider";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RiskScaleLevel } from '@/types/risk-scales';
import { RiskLevel } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Sort levels by level_value
  const sortedLevels = Array.isArray(levels) 
    ? [...levels].sort((a, b) => {
        const aValue = a.levelValue !== undefined ? a.levelValue : (a.level_value || 0);
        const bValue = b.levelValue !== undefined ? b.levelValue : (b.level_value || 0);
        return aValue - bValue;
      })
    : [];
  
  // Initialize slider value when component is loaded
  useEffect(() => {
    if (sortedLevels.length > 0 && value) {
      const index = mapRiskLevelToIndex(value, sortedLevels);
      console.log(`RiskScaleSlider (${name}): Initializing slider to position ${index} for value ${value}`);
      setSliderValue(index);
      setIsInitialized(true);
    }
  }, [value, sortedLevels, name]);
  
  // Handle slider value change
  const handleSliderChange = useCallback((newValue: number[]) => {
    if (!sortedLevels.length) return;
    
    const position = Math.round(newValue[0]); // Ensure the position is an integer
    
    // Only update if position has actually changed
    if (position !== sliderValue && position >= 0 && position < sortedLevels.length) {
      console.log(`RiskScaleSlider (${name}): Slider changed to position ${position}`);
      setSliderValue(position);
      const riskLevel = mapPositionToRiskLevel(position, sortedLevels);
      console.log(`RiskScaleSlider (${name}): Setting risk level to: ${riskLevel}`);
      onChange(riskLevel);
    }
  }, [sliderValue, sortedLevels, onChange, name]);
  
  // Handle label click
  const handleLabelClick = useCallback((index: number) => {
    if (!sortedLevels.length || index < 0 || index >= sortedLevels.length) return;
    
    console.log(`RiskScaleSlider (${name}): Label clicked: ${index}, current: ${sliderValue}`);
    setSliderValue(index);
    const riskLevel = mapPositionToRiskLevel(index, sortedLevels);
    console.log(`RiskScaleSlider (${name}): Setting risk level to: ${riskLevel}`);
    onChange(riskLevel);
  }, [sortedLevels, onChange, sliderValue, name]);
  
  // Get current level from slider value
  const currentLevel = sortedLevels[sliderValue] || null;
  
  // Custom styles to match slider track with the dot colors
  const getSliderTrackStyle = useCallback(() => {
    if (!sortedLevels.length) return {};
    
    // Create a gradient based on the colors of the levels
    const colors = sortedLevels.map(level => level.color || '#e2e8f0');
    const steps = colors.map((color, index) => 
      `${color} ${index * (100 / (colors.length - 1))}%`
    ).join(', ');
    
    return {
      background: `linear-gradient(to right, ${steps})`
    };
  }, [sortedLevels]);
  
  if (!sortedLevels || !sortedLevels.length) {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormDescription>
          Échelle de risque non configurée. Veuillez configurer les échelles de risque.
        </FormDescription>
        
        <div className="space-y-6 pt-1">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </FormItem>
    );
  }
  
  if (!isInitialized) {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
        
        <div className="space-y-6 pt-1">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </FormItem>
    );
  }
  
  return (
    <FormItem>
      <FormLabel className="text-lg font-medium mb-1">{label}</FormLabel>
      {description && <FormDescription className="mb-4">{description}</FormDescription>}
      
      <div className="space-y-4 pt-1">
        <FormControl>
          <div className="relative pt-4 px-3">
            {/* Custom track styling */}
            <div 
              className="absolute h-2 w-[calc(100%-24px)] top-[22px] left-[12px] rounded-full overflow-hidden"
              style={getSliderTrackStyle()}
            />
            
            {/* Slider component with larger clickable area */}
            <Slider
              value={[sliderValue]}
              max={sortedLevels.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="my-4"
              data-testid={`${name}-slider`}
              aria-label={label}
            />
            
            {/* Labels under the slider */}
            <SliderLabels 
              levels={sortedLevels} 
              selectedIndex={sliderValue} 
              onLabelClick={handleLabelClick}
            />
          </div>
        </FormControl>
        
        {/* Description of selected level shown below the slider */}
        {currentLevel && (
          <div className="mt-6">
            <RiskLevelIndicator level={currentLevel} />
          </div>
        )}
      </div>
      
      <FormMessage />
    </FormItem>
  );
};

export default RiskScaleSlider;
