
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';

interface SliderLabelsProps {
  levels: RiskScaleLevel[];
  selectedIndex: number;
}

const SliderLabels: React.FC<SliderLabelsProps> = ({ levels, selectedIndex }) => {
  return (
    <div className="mt-2 flex relative">
      {levels.map((level, index) => {
        const isSelected = selectedIndex === index;
        
        // Position each label precisely
        const segmentWidth = 100 / levels.length;
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
            
            {/* Show text label of selected level and abbreviated labels for others */}
            {isSelected ? (
              <div className="text-xs font-medium text-primary mt-1">{level.name}</div>
            ) : (
              <div className="text-xs text-muted-foreground invisible">.</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SliderLabels;
