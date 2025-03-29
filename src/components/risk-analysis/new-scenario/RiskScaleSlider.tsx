
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
    (a.levelValue || a.level_value || 0) - (b.levelValue || b.level_value || 0)
  );
  
  // Map risk level (low, medium, etc.) to slider position
  useEffect(() => {
    const levelIndex = sortedLevels.findIndex(level => {
      // First try to find by name (case insensitive)
      if (level.name.toLowerCase() === value.toLowerCase()) {
        return true;
      }
      
      // Then try to match by approximate mapping
      if (value === 'low' && (level.levelValue === 1 || level.level_value === 1 || level.name.toLowerCase().includes('faibl') || level.name.toLowerCase().includes('négligeable'))) {
        return true;
      }
      if (value === 'medium' && (level.levelValue === 2 || level.level_value === 2 || level.name.toLowerCase().includes('moyen') || level.name.toLowerCase().includes('modér') || level.name.toLowerCase().includes('signif'))) {
        return true;
      }
      if (value === 'high' && (level.levelValue === 3 || level.level_value === 3 || level.name.toLowerCase().includes('élev') || level.name.toLowerCase().includes('haut') || level.name.toLowerCase().includes('import'))) {
        return true;
      }
      if (value === 'critical' && (level.levelValue === 4 || level.level_value === 4 || level.name.toLowerCase().includes('critique') || level.name.toLowerCase().includes('critic') || level.name.toLowerCase().includes('majeur'))) {
        return true;
      }
      
      return false;
    });
    
    setSliderValue(levelIndex >= 0 ? levelIndex : 0);
  }, [value, sortedLevels]);
  
  // Map slider position to risk level
  const handleSliderChange = (newValue: number[]) => {
    const position = newValue[0];
    
    // Ensure the position is an integer
    const intPosition = Math.round(position);
    
    if (intPosition !== sliderValue) {
      setSliderValue(intPosition);
      
      if (sortedLevels[intPosition]) {
        // Map back to standard risk level based on position
        let riskLevel: RiskLevel = 'low';
        
        if (intPosition === 0) riskLevel = 'low';
        else if (intPosition === sortedLevels.length - 1) riskLevel = 'critical';
        else if (intPosition === Math.floor(sortedLevels.length / 2)) riskLevel = 'medium';
        else if (intPosition > Math.floor(sortedLevels.length / 2)) riskLevel = 'high';
        
        // Override with more accurate mapping if possible
        const levelName = sortedLevels[intPosition].name.toLowerCase();
        if (levelName.includes('faibl') || levelName.includes('néglig')) riskLevel = 'low';
        else if (levelName.includes('moyen') || levelName.includes('modér') || levelName.includes('signif')) riskLevel = 'medium';
        else if (levelName.includes('élev') || levelName.includes('haut') || levelName.includes('import')) riskLevel = 'high';
        else if (levelName.includes('critique') || levelName.includes('critic') || levelName.includes('majeur')) riskLevel = 'critical';
        
        onChange(riskLevel);
      }
    }
  };
  
  // Handle direct level click
  const handleLevelClick = (index: number) => {
    setSliderValue(index);
    handleSliderChange([index]);
  };
  
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
  
  // Get current level from slider value
  const currentLevel = sortedLevels[sliderValue];
  
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      
      <div className="space-y-4 pt-2">
        <FormControl>
          <div className="relative pb-16 pt-1">
            {/* Slider avec taille augmentée pour faciliter la manipulation */}
            <Slider
              value={[sliderValue]}
              max={sortedLevels.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="py-5 my-4"
              aria-label={label}
            />
            
            {/* Positions des niveaux sous la barre - déplacé sous la barre */}
            <div className="flex justify-between absolute w-full bottom-0">
              {sortedLevels.map((level, index) => {
                // Calcul du décalage pour aligner le centre du point avec les repères
                const offset = index === 0 ? 0 : index === sortedLevels.length - 1 ? -100 : -50;
                const isActive = sliderValue === index;
                
                return (
                  <div 
                    key={level.id} 
                    className="flex flex-col items-center cursor-pointer"
                    style={{ 
                      position: 'absolute', 
                      left: `${(index / (sortedLevels.length - 1)) * 100}%`,
                      transform: `translateX(${offset}%)` 
                    }}
                    onClick={() => handleLevelClick(index)}
                  >
                    <div 
                      className={`w-4 h-4 mb-1 rounded-full transition-all ${isActive ? 'ring-2 ring-primary scale-125' : 'hover:scale-110'}`} 
                      style={{ backgroundColor: level.color || '#e2e8f0' }} 
                    />
                    <span className={`text-xs font-medium whitespace-nowrap transition-all ${isActive ? 'text-primary font-semibold' : ''}`}>
                      {level.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </FormControl>
        
        {/* Description du niveau sélectionné affichée sous la barre */}
        <div 
          className="px-4 py-3 rounded-md text-sm transition-all shadow-sm"
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
