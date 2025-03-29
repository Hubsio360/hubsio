
import React, { useMemo, useState } from 'react';
import { RiskScenario, RiskLevel } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RiskScaleLevel } from '@/types/risk-scales';

interface RiskHeatmapProps {
  scenarios: RiskScenario[];
  impactLevels: RiskScaleLevel[];
  likelihoodLevels: RiskScaleLevel[];
  type: 'raw' | 'residual';
  hoveredScenarioId: string | null;
  onHoverScenario: (id: string | null) => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({
  scenarios,
  impactLevels,
  likelihoodLevels,
  type,
  hoveredScenarioId,
  onHoverScenario,
}) => {
  // Obtenir la couleur de fond pour la cellule de la matrice basée sur les valeurs d'impact et de probabilité
  const getCellColor = (impactValue: number, likelihoodValue: number) => {
    const totalValue = impactValue * likelihoodValue;
    const maxValue = impactLevels.length * likelihoodLevels.length;
    
    // Calculer le niveau de risque pour définir la couleur
    const riskPercentage = (totalValue / maxValue) * 100;
    
    if (riskPercentage < 20) {
      return 'bg-green-500'; // Risque très faible
    } else if (riskPercentage < 40) {
      return 'bg-green-400'; // Risque faible
    } else if (riskPercentage < 60) {
      return 'bg-yellow-400'; // Risque modéré
    } else if (riskPercentage < 80) {
      return 'bg-orange-400'; // Risque élevé
    } else {
      return 'bg-red-500'; // Risque critique
    }
  };

  // Mapper les scénarios pour la visualisation
  const mappedScenarios = useMemo(() => {
    return scenarios.map(scenario => {
      let impactLevel: RiskLevel = 'low';
      let likelihoodLevel: RiskLevel = 'low';
      
      if (type === 'raw') {
        impactLevel = scenario.rawImpact || scenario.impactLevel;
        likelihoodLevel = scenario.rawLikelihood || scenario.likelihood;
      } else {
        impactLevel = scenario.residualImpact || 'low';
        likelihoodLevel = scenario.residualLikelihood || 'low';
      }
      
      return {
        ...scenario,
        displayImpact: impactLevel,
        displayLikelihood: likelihoodLevel
      };
    });
  }, [scenarios, type]);

  // Obtenir l'index numérique pour un niveau de risque
  const getRiskLevelIndex = (level: RiskLevel, levels: RiskScaleLevel[]): number => {
    // Convertir le niveau en indice dans la matrice
    const levelMap: Record<RiskLevel, number> = {
      'low': 0,
      'medium': Math.floor(levels.length / 3),
      'high': Math.floor(levels.length / 3) * 2,
      'critical': levels.length - 1
    };
    
    return levelMap[level] || 0;
  };

  const getTranslatedLevel = (level: RiskLevel): string => {
    switch (level) {
      case 'low': return 'Faible';
      case 'medium': return 'Moyen';
      case 'high': return 'Élevé';
      case 'critical': return 'Critique';
      default: return level;
    }
  };

  return (
    <div className="relative overflow-x-auto">
      <div className="flex">
        {/* En-tête des colonnes - Probabilité */}
        <div className="w-24"></div> {/* Cellule vide pour l'alignement */}
        <div className="flex-1">
          <div className="grid grid-cols-5 text-center text-sm font-medium">
            {likelihoodLevels.map((level, index) => (
              <div key={`likelihood-${index}`} className="px-2 py-1">
                {level.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Corps de la matrice */}
      <div className="flex">
        {/* Labels d'impact (axe Y) */}
        <div className="w-24">
          <div className="grid grid-rows-5 h-full">
            {[...impactLevels].reverse().map((level, index) => (
              <div 
                key={`impact-${index}`} 
                className="flex items-center justify-end pr-2 h-16"
              >
                <span className="text-sm font-medium">{level.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Grille de la matrice */}
        <div className="flex-1">
          <div className="grid grid-rows-5" style={{ height: `${impactLevels.length * 4}rem` }}>
            {[...impactLevels].reverse().map((impactLevel, impactIndex) => (
              <div key={`row-${impactIndex}`} className="grid grid-cols-5">
                {likelihoodLevels.map((likelihoodLevel, likelihoodIndex) => {
                  const reversedImpactIndex = impactLevels.length - 1 - impactIndex;
                  return (
                    <div
                      key={`cell-${impactIndex}-${likelihoodIndex}`}
                      className={`${getCellColor(reversedImpactIndex + 1, likelihoodIndex + 1)} h-16 relative border border-gray-200 dark:border-gray-700`}
                    >
                      {/* Points des scénarios */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {mappedScenarios.map(scenario => {
                          const scenarioImpactIndex = getRiskLevelIndex(scenario.displayImpact, impactLevels);
                          const scenarioLikelihoodIndex = getRiskLevelIndex(scenario.displayLikelihood, likelihoodLevels);
                          
                          // N'afficher que si le scénario correspond à cette cellule
                          const reversedImpactForComparison = impactLevels.length - 1 - impactIndex;
                          if (scenarioImpactIndex === reversedImpactForComparison && scenarioLikelihoodIndex === likelihoodIndex) {
                            const isHovered = scenario.id === hoveredScenarioId;
                            const opacity = hoveredScenarioId === null || isHovered ? 1 : 0.4;
                            
                            return (
                              <TooltipProvider key={scenario.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className={`h-3 w-3 rounded-full bg-black transition-all duration-200 ease-in-out`}
                                      style={{ opacity }}
                                      onMouseEnter={() => onHoverScenario(scenario.id)}
                                      onMouseLeave={() => onHoverScenario(null)}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="p-2 max-w-xs">
                                      <p className="font-medium">{scenario.name}</p>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>Impact: {getTranslatedLevel(scenario.displayImpact)}</div>
                                        <div>Probabilité: {getTranslatedLevel(scenario.displayLikelihood)}</div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
