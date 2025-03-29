
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SliderLabelsProps {
  levels: RiskScaleLevel[];
  selectedIndex: number;
  onLabelClick?: (index: number) => void;
}

const SliderLabels: React.FC<SliderLabelsProps> = ({ levels, selectedIndex, onLabelClick }) => {
  // Don't render anything if no levels are provided
  if (!levels || levels.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      <div className="flex justify-between relative pb-2 px-3 mt-6">
        {levels.map((level, index) => {
          const isSelected = selectedIndex === index;
          
          return (
            <TooltipProvider key={level.id || index}>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div 
                    className="relative flex flex-col items-center cursor-pointer" 
                    style={{ width: '40px' }}
                    onClick={() => onLabelClick && onLabelClick(index)}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    aria-label={`Select ${level.name} level`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onLabelClick && onLabelClick(index);
                      }
                    }}
                  >
                    {/* Dot indicator for each level */}
                    <div 
                      className={`w-5 h-5 rounded-full mb-2 transition-all ${
                        isSelected ? 'scale-125 ring-2 ring-white/20 ring-offset-1 shadow-glow' : ''
                      }`}
                      style={{ 
                        backgroundColor: level.color || '#e2e8f0',
                        boxShadow: isSelected ? `0 0 12px ${level.color}40` : 'none'
                      }}
                    />
                    
                    {/* Label below the dot */}
                    <div className={`text-xs text-center whitespace-nowrap ${
                      isSelected ? 'font-medium text-white' : 'text-muted-foreground'
                    }`} style={{ maxWidth: '60px' }}>
                      {level.name}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="z-50"
                  style={{ 
                    backgroundColor: `${level.color}E0`,
                    color: '#fff',
                    borderColor: level.color
                  }}
                >
                  <p className="font-semibold">{level.name}</p>
                  {level.description && <p className="text-xs opacity-90">{level.description}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default SliderLabels;
