
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SliderLabelsProps {
  levels: RiskScaleLevel[];
  selectedIndex: number;
}

const SliderLabels: React.FC<SliderLabelsProps> = ({ levels, selectedIndex }) => {
  // Don't render anything if no levels are provided
  if (!levels || levels.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex relative h-14">
      {levels.map((level, index) => {
        const isSelected = selectedIndex === index;
        
        // Position each label precisely
        const segmentWidth = 100 / levels.length;
        const leftPosition = index * segmentWidth;
        
        return (
          <TooltipProvider key={level.id || index}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div
                  className="absolute text-center cursor-pointer"
                  style={{ 
                    left: `${leftPosition}%`,
                    width: `${segmentWidth}%`
                  }}
                >
                  {/* Dot indicator for each level */}
                  <div 
                    className={`w-4 h-4 rounded-full mx-auto mb-2 transition-all ${isSelected ? 'scale-125 ring-2 ring-primary ring-offset-1' : ''}`}
                    style={{ backgroundColor: level.color || '#e2e8f0' }}
                  ></div>
                  
                  {/* Always show abbreviated labels, selected one is bold */}
                  <div className={`text-xs ${isSelected ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                    {level.name && level.name.length > 8 
                      ? `${level.name.substring(0, 8)}...` 
                      : level.name || 'Niveau'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="z-50">
                <p>{level.name}</p>
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
