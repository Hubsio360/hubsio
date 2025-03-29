
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RiskScaleLevel } from '@/types/risk-scales';
import { RiskLevel } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Map risk level (low, medium, etc.) to slider position
  useEffect(() => {
    const levelIndex = sortedLevels.findIndex(level => {
      // First try to find by name (case insensitive)
      if (level.name.toLowerCase() === value.toLowerCase()) {
        return true;
      }
      
      // Match by partial name for better recognition
      const levelName = level.name.toLowerCase();
      if (value === 'low' && (
        levelName.includes('faibl') || 
        levelName.includes('néglig') || 
        levelName.includes('peu probable')
      )) {
        return true;
      }
      if (value === 'medium' && (
        levelName.includes('moyen') || 
        levelName.includes('modér') || 
        levelName.includes('signif') || 
        levelName.includes('relativement')
      )) {
        return true;
      }
      if (value === 'high' && (
        levelName.includes('élev') || 
        levelName.includes('haut') || 
        levelName.includes('import')
      )) {
        return true;
      }
      if (value === 'critical' && (
        levelName.includes('critique') || 
        levelName.includes('critic') || 
        levelName.includes('majeur') || 
        levelName.includes('certain')
      )) {
        return true;
      }
      
      // Try to match by level value as fallback
      if (value === 'low' && (level.levelValue === 1 || level.level_value === 1)) {
        return true;
      }
      if (value === 'medium' && (level.levelValue === 2 || level.level_value === 2)) {
        return true;
      }
      if (value === 'high' && (level.levelValue === 3 || level.level_value === 3)) {
        return true;
      }
      if (value === 'critical' && (level.levelValue === 4 || level.level_value === 4)) {
        return true;
      }
      
      return false;
    });
    
    setSliderValue(levelIndex >= 0 ? levelIndex : 0);
  }, [value, sortedLevels]);
  
  // Map slider position to risk level
  const handleSliderChange = (newValue: number[]) => {
    const position = Math.round(newValue[0]); // Ensure the position is an integer
    
    if (position !== sliderValue) {
      setSliderValue(position);
      
      if (sortedLevels[position]) {
        // Map back to standard risk level
        let riskLevel: RiskLevel = 'low';
        
        // Improved mapping by name matching
        const levelName = sortedLevels[position].name.toLowerCase();
        
        if (levelName.includes('néglig') || levelName.includes('faibl') || levelName.includes('peu probable')) {
          riskLevel = 'low';
        }
        else if (levelName.includes('signif') || levelName.includes('moyen') || levelName.includes('modér') || levelName.includes('relativement')) {
          riskLevel = 'medium';
        }
        else if (levelName.includes('élev') || levelName.includes('haut') || levelName.includes('import')) {
          riskLevel = 'high';
        }
        else if (levelName.includes('critique') || levelName.includes('critic') || levelName.includes('majeur') || levelName.includes('certain')) {
          riskLevel = 'critical';
        }
        // Fallback based on position if name matching fails
        else if (position === 0) {
          riskLevel = 'low';
        }
        else if (position === sortedLevels.length - 1) {
          riskLevel = 'critical';
        }
        else if (position <= Math.floor(sortedLevels.length / 2)) {
          riskLevel = 'medium';
        }
        else {
          riskLevel = 'high';
        }
        
        onChange(riskLevel);
      }
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
          <div className="relative pt-6">
            {/* Updated slider with better step control */}
            <Slider
              value={[sliderValue]}
              max={sortedLevels.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="my-2"
              data-testid={`${name}-slider`}
              aria-label={label}
            />
            
            {/* Improved labels under the slider - with better spacing */}
            <div className="mt-2 flex relative">
              {sortedLevels.map((level, index) => {
                const isSelected = sliderValue === index;
                
                // Position each label precisely
                const segmentWidth = 100 / sortedLevels.length;
                const leftPosition = index * segmentWidth;
                
                return (
                  <div
                    key={level.id}
                    className="absolute text-center"
                    style={{ 
                      left: `${leftPosition}%`,
                      width: `${segmentWidth}%`
                    }}
                  >
                    {/* Dot indicator for each level */}
                    <div 
                      className={`w-3 h-3 rounded-full mx-auto mb-2 transition-all ${isSelected ? 'scale-125' : ''}`}
                      style={{ backgroundColor: level.color || '#e2e8f0' }}
                    ></div>
                    
                    {/* Only show text label of selected level and abbreviated labels for others */}
                    {isSelected ? (
                      <div className="text-xs font-medium text-primary mt-1">{level.name}</div>
                    ) : (
                      <div className="text-xs text-muted-foreground invisible">.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FormControl>
        
        {/* Description of selected level shown below the slider */}
        <div 
          className="px-4 py-3 rounded-md text-sm transition-all shadow-sm mt-8"
          style={{ 
            backgroundColor: currentLevel?.color || '#e2e8f0',
            color: getContrastColor(currentLevel?.color || '#e2e8f0')
          }}
        >
          <div className="font-semibold mb-1">{currentLevel?.name || 'Niveau non défini'}</div>
          <div className="text-sm">{currentLevel?.description || 'Description non disponible'}</div>
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
