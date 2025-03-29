
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { getContrastColor } from '@/utils/colorUtils';

interface RiskLevelIndicatorProps {
  level: RiskScaleLevel;
}

const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({ level }) => {
  if (!level) return null;
  
  return (
    <div 
      className="px-6 py-4 rounded-xl text-sm transition-all shadow-lg mt-6 border"
      style={{ 
        backgroundColor: `${level.color}20`,
        borderColor: `${level.color}40`,
        color: level.color || '#e2e8f0'
      }}
    >
      <div className="font-semibold text-base mb-2" style={{ color: level.color }}>{level.name || 'Niveau non défini'}</div>
      <div className="text-sm opacity-90">{level.description || 'Description non disponible'}</div>
    </div>
  );
};

export default RiskLevelIndicator;
