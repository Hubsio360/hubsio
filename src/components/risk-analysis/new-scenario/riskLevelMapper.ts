
import { RiskLevel } from '@/types';
import { RiskScaleLevel } from '@/types/risk-scales';

/**
 * Maps the position in the sorted risk levels array to a standard risk level
 * @param position - The position in the sorted array
 * @param sortedLevels - The sorted array of risk levels
 * @returns The corresponding standard risk level
 */
export function mapPositionToRiskLevel(position: number, sortedLevels: RiskScaleLevel[]): RiskLevel {
  if (!sortedLevels || !sortedLevels.length) {
    return 'low';
  }
  
  const levelName = sortedLevels[position]?.name.toLowerCase() || '';
  
  // Map level name to standard risk level
  if (levelName.includes('néglig') || levelName.includes('faibl') || levelName.includes('peu probable')) {
    return 'low';
  }
  else if (levelName.includes('signif') || levelName.includes('moyen') || levelName.includes('modér') || levelName.includes('relativement')) {
    return 'medium';
  }
  else if (levelName.includes('élev') || levelName.includes('haut') || levelName.includes('import')) {
    return 'high';
  }
  else if (levelName.includes('critique') || levelName.includes('critic') || levelName.includes('majeur') || levelName.includes('certain')) {
    return 'critical';
  }
  
  // Fallback based on position
  if (position === 0) {
    return 'low';
  }
  else if (position === sortedLevels.length - 1) {
    return 'critical';
  }
  else if (position <= Math.floor(sortedLevels.length / 2)) {
    return 'medium';
  }
  else {
    return 'high';
  }
}

/**
 * Maps a risk level to the corresponding index in the sorted levels array
 * @param value - The risk level to map
 * @param sortedLevels - The sorted array of risk levels
 * @returns The index in the sorted array
 */
export function mapRiskLevelToIndex(value: RiskLevel, sortedLevels: RiskScaleLevel[]): number {
  const levelIndex = sortedLevels.findIndex(level => {
    // First try to find by name (case insensitive)
    if (level.name.toLowerCase() === value.toLowerCase()) {
      return true;
    }
    
    // Match by partial name for better recognition
    const levelName = level.name.toLowerCase();
    if (value === 'low' && (
      levelName.includes('faibl') || 
      levelName.includes('néglig') || 
      levelName.includes('peu probable')
    )) {
      return true;
    }
    if (value === 'medium' && (
      levelName.includes('moyen') || 
      levelName.includes('modér') || 
      levelName.includes('signif') || 
      levelName.includes('relativement')
    )) {
      return true;
    }
    if (value === 'high' && (
      levelName.includes('élev') || 
      levelName.includes('haut') || 
      levelName.includes('import')
    )) {
      return true;
    }
    if (value === 'critical' && (
      levelName.includes('critique') || 
      levelName.includes('critic') || 
      levelName.includes('majeur') || 
      levelName.includes('certain')
    )) {
      return true;
    }
    
    // Try to match by level value as fallback
    if (value === 'low' && (level.levelValue === 1 || level.level_value === 1)) {
      return true;
    }
    if (value === 'medium' && (level.levelValue === 2 || level.level_value === 2)) {
      return true;
    }
    if (value === 'high' && (level.levelValue === 3 || level.level_value === 3)) {
      return true;
    }
    if (value === 'critical' && (level.levelValue === 4 || level.level_value === 4)) {
      return true;
    }
    
    return false;
  });
  
  return levelIndex >= 0 ? levelIndex : 0;
}
