
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SliderLabelsProps {
  levels: RiskScaleLevel[];
  selectedIndex: number;
}

const SliderLabels: React.FC<SliderLabelsProps> = ({ levels, selectedIndex }) => {
  return (
    <div className="mt-4 flex relative h-12">
      {levels.map((level, index) => {
        const isSelected = selectedIndex === index;
        
        // Position each label precisely
        const segmentWidth = 100 / levels.length;
        const leftPosition = index * segmentWidth;
        
        return (
          <TooltipProvider key={level.id}>
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
                    {level.name.substring(0, 8)}{level.name.length > 8 ? '...' : ''}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{level.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default SliderLabels;
