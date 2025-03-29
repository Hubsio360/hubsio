
import React from 'react';
import { RiskScaleLevel } from '@/types/risk-scales';
import { getContrastColor } from '@/utils/colorUtils';

interface RiskLevelIndicatorProps {
  level: RiskScaleLevel;
}

// Fixed colors for the 4 risk levels
const levelColors = [
  "#4CAF50", // Négligeable (vert)
  "#FFA726", // Faible (jaune)
  "#9C27B0", // Significatif (violet)
  "#F44336", // Majeur (rouge)
];

const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({ level }) => {
  // Get appropriate color based on level value
  const getLevelColor = () => {
    const levelValue = level.levelValue !== undefined ? level.levelValue : (level.level_value || 0);
    if (levelValue >= 0 && levelValue < levelColors.length) {
      return levelColors[levelValue];
    }
    return level.color || '#e2e8f0';
  };

  const color = getLevelColor();
  
  return (
    <div 
      className="px-6 py-4 rounded-lg text-sm transition-all shadow-md mt-4 border border-white/10"
      style={{ 
        backgroundColor: color,
        color: getContrastColor(color)
      }}
    >
      <div className="font-bold mb-2 text-lg">{level?.name || 'Niveau non défini'}</div>
      <div className="text-sm opacity-90">{level?.description || 'Description non disponible'}</div>
    </div>
  );
};

export default RiskLevelIndicator;
