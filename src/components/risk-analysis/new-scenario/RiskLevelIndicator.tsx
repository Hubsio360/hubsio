
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { getContrastColor } from '@/utils/colorUtils';

interface RiskLevelIndicatorProps {
  level: RiskScaleLevel;
}

const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({ level }) => {
  return (
    <div 
      className="px-4 py-3 rounded-md text-sm transition-all shadow-sm mt-8"
      style={{ 
        backgroundColor: level?.color || '#e2e8f0',
        color: getContrastColor(level?.color || '#e2e8f0')
      }}
    >
      <div className="font-semibold mb-1">{level?.name || 'Niveau non défini'}</div>
      <div className="text-sm">{level?.description || 'Description non disponible'}</div>
    </div>
  );
};

export default RiskLevelIndicator;
