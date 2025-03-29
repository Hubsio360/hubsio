
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SliderLabelsProps {
  levels: RiskScaleLevel[];
  selectedIndex: number;
}

const SliderLabels: React.FC<SliderLabelsProps> = ({ levels, selectedIndex }) => {
  // Don't render anything if no levels are provided
  if (!levels || levels.length === 0) {
    return null;
  }

  // Fixed colors for the 4 risk levels
  const levelColors = [
    "#4CAF50", // Négligeable (vert)
    "#FFA726", // Faible (jaune)
    "#9C27B0", // Significatif (violet)
    "#F44336", // Majeur (rouge)
  ];

  return (
    <div className="mt-6 relative h-16">
      {levels.map((level, index) => {
        const isSelected = selectedIndex === index;
        
        // Position each label precisely
        const segmentWidth = 100 / (levels.length - 1);
        const leftPosition = index === 0 ? 0 : index === levels.length - 1 ? 100 : index * segmentWidth;
        
        // Use our fixed colors or fallback to the level's color
        const color = index < levelColors.length ? levelColors[index] : level.color || '#e2e8f0';
        
        return (
          <TooltipProvider key={level.id || index}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className="absolute transform -translate-x-1/2 text-center cursor-pointer"
                  style={{ 
                    left: `${leftPosition}%`,
                  }}
                >
                  {/* Dot indicator for each level */}
                  <div 
                    className={cn(
                      "rounded-full mx-auto mb-2.5 transition-all border-2",
                      isSelected 
                        ? "w-6 h-6 scale-110 border-white shadow-lg" 
                        : "w-4 h-4 border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  ></div>
                  
                  {/* Always show labels, selected one is bold */}
                  <div className={cn(
                    "text-xs whitespace-nowrap transition-all",
                    isSelected ? "font-medium text-white" : "text-muted-foreground"
                  )}>
                    {level.name || 'Niveau'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" className="z-50 max-w-[200px]">
                <p className="font-medium">{level.name}</p>
                {level.description && <p className="text-xs text-muted-foreground">{level.description}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default SliderLabels;
