
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { getContrastColor } from '@/utils/colorUtils';

interface RiskLevelIndicatorProps {
  level: RiskScaleLevel;
}

const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({ level }) => {
  if (!level) return null;
  
  // Ajuster l'opacité des couleurs pour une meilleure cohérence visuelle
  const backgroundColor = `${level.color}15`;
  const borderColor = `${level.color}30`;
  const textColor = level.color;
  
  return (
    <div 
      className="px-6 py-4 rounded-xl text-sm transition-all shadow-md mt-2 border"
      style={{ 
        backgroundColor,
        borderColor,
        color: textColor
      }}
    >
      <div className="font-semibold text-base mb-2" style={{ color: level.color }}>{level.name || 'Niveau non défini'}</div>
      <div className="text-sm opacity-90">{level.description || 'Description non disponible'}</div>
    </div>
  );
};

export default RiskLevelIndicator;
