
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
  
  // Get the level at the specified position
  const level = sortedLevels[position];
  if (!level) return 'low';
  
  const levelName = level.name.toLowerCase();
  
  // Map level name to standard risk level based on common terms in French and English
  if (levelName.includes('néglig') || levelName.includes('faibl') || 
      levelName.includes('peu probable') || levelName.includes('rare') || 
      levelName === 'low' || levelName === 'bas' || levelName === 'basse') {
    return 'low';
  }
  
  if (levelName.includes('signif') || levelName.includes('moyen') || 
      levelName.includes('modér') || levelName.includes('relativement') || 
      levelName === 'medium' || levelName === 'normal') {
    return 'medium';
  }
  
  if (levelName.includes('élev') || levelName.includes('haut') || 
      levelName.includes('import') || levelName.includes('fort') || 
      levelName === 'high') {
    return 'high';
  }
  
  if (levelName.includes('critique') || levelName.includes('critic') || 
      levelName.includes('majeur') || levelName.includes('certain') || 
      levelName.includes('extrême') || levelName === 'critical') {
    return 'critical';
  }
  
  // Fallback to position-based mapping if name matching fails
  if (sortedLevels.length <= 2) {
    return position === 0 ? 'low' : 'high';
  } else if (sortedLevels.length <= 3) {
    if (position === 0) return 'low';
    if (position === 1) return 'medium';
    return 'high';
  } else {
    if (position === 0) return 'low';
    if (position === sortedLevels.length - 1) return 'critical';
    if (position <= Math.floor(sortedLevels.length / 2)) return 'medium';
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
  // First attempt: exact match based on level strings - en français et en anglais
  for (let i = 0; i < sortedLevels.length; i++) {
    const level = sortedLevels[i];
    const levelName = level.name.toLowerCase();
    
    // Direct match for risk level
    if (value === 'low' && (levelName === 'low' || levelName === 'bas' || levelName === 'basse' || 
                           levelName === 'faible' || levelName === 'négligeable' || levelName === 'rare')) {
      return i;
    }
    
    if (value === 'medium' && (levelName === 'medium' || levelName === 'moyen' || levelName === 'moyenne' || 
                              levelName === 'modéré' || levelName === 'modérée' || levelName === 'significatif')) {
      return i;
    }
    
    if (value === 'high' && (levelName === 'high' || levelName === 'haut' || levelName === 'haute' || 
                            levelName === 'élevé' || levelName === 'élevée' || levelName === 'important')) {
      return i;
    }
    
    if (value === 'critical' && (levelName === 'critical' || levelName === 'critique' || 
                                levelName === 'majeur' || levelName === 'certain' || levelName === 'extrême')) {
      return i;
    }
  }

  // Second attempt: partial match
  for (let i = 0; i < sortedLevels.length; i++) {
    const level = sortedLevels[i];
    const levelName = level.name.toLowerCase();
    
    if (value === 'low' && (levelName.includes('faibl') || levelName.includes('néglig') || 
                           levelName.includes('peu probable') || levelName.includes('bas'))) {
      return i;
    }
    
    if (value === 'medium' && (levelName.includes('moyen') || levelName.includes('modér') || 
                              levelName.includes('signif') || levelName.includes('relativement'))) {
      return i;
    }
    
    if (value === 'high' && (levelName.includes('élev') || levelName.includes('haut') || 
                            levelName.includes('import') || levelName.includes('fort'))) {
      return i;
    }
    
    if (value === 'critical' && (levelName.includes('critique') || levelName.includes('critic') || 
                                levelName.includes('majeur') || levelName.includes('certain') || 
                                levelName.includes('extrême'))) {
      return i;
    }
  }
  
  // Third attempt: position-based based on level values
  if (value === 'low') return 0;
  if (value === 'critical' && sortedLevels.length > 3) return sortedLevels.length - 1;
  if (value === 'high') return Math.min(sortedLevels.length - 1, 2);
  return Math.min(sortedLevels.length - 2, 1);
}
