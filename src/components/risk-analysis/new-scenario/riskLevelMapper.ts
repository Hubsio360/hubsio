
import { RiskScaleLevel } from '@/types/risk-scales';
import { RiskLevel } from '@/types';

// Maps a slider position to a risk level
export const mapPositionToRiskLevel = (position: number, levels: RiskScaleLevel[]): RiskLevel => {
  if (!levels.length) return 'medium';
  
  // Sort by level_value to ensure proper order
  const sortedLevels = [...levels].sort((a, b) => a.level_value - b.level_value);
  
  if (position < 0 || position >= sortedLevels.length) {
    console.error(`Invalid position ${position} for levels array of length ${sortedLevels.length}`);
    return 'medium';
  }
  
  const level = sortedLevels[position];
  
  // Map level_value to risk level
  switch (level.level_value) {
    case 1:
      return 'low';
    case 2:
      return 'medium';
    case 3:
      return 'high';
    case 4:
      return 'critical';
    default:
      console.error(`Unknown level value: ${level.level_value}`);
      return 'medium';
  }
};

// Maps a risk level to a slider position
export const mapRiskLevelToIndex = (riskLevel: RiskLevel, levels: RiskScaleLevel[]): number => {
  if (!levels.length) return 0;
  
  // Sort by level_value to ensure proper order
  const sortedLevels = [...levels].sort((a, b) => a.level_value - b.level_value);
  
  // Map risk level to level_value
  let targetLevelValue: number;
  switch (riskLevel) {
    case 'low':
      targetLevelValue = 1;
      break;
    case 'medium':
      targetLevelValue = 2;
      break;
    case 'high':
      targetLevelValue = 3;
      break;
    case 'critical':
      targetLevelValue = 4;
      break;
    default:
      console.error(`Unknown risk level: ${riskLevel}`);
      targetLevelValue = 2; // Default to medium
  }
  
  // Find the index of the level with the target level_value
  const index = sortedLevels.findIndex(level => level.level_value === targetLevelValue);
  
  // If not found, return the default index for medium (or 0 if only one level)
  if (index === -1) {
    console.warn(`No level found with value ${targetLevelValue}`);
    const mediumIndex = sortedLevels.findIndex(level => level.level_value === 2);
    return mediumIndex !== -1 ? mediumIndex : 0;
  }
  
  return index;
};
