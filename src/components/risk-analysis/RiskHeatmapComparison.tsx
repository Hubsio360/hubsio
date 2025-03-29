
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { RiskScenario, RiskLevel } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiskHeatmap } from './RiskHeatmap';
import { Loader2 } from 'lucide-react';
import { CompanyRiskScale } from '@/types/risk-scales';

interface RiskHeatmapComparisonProps {
  riskScenarios: RiskScenario[];
  isLoading: boolean;
}

export const RiskHeatmapComparison: React.FC<RiskHeatmapComparisonProps> = ({ 
  riskScenarios,
  isLoading
}) => {
  const { companyRiskScales } = useData();
  const [hoveredScenarioId, setHoveredScenarioId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'side-by-side' | 'stacked'>('side-by-side');

  // Filtrer les échelles pertinentes (impact et probabilité)
  const impactScale = useMemo(() => (
    companyRiskScales.find(scale => 
      scale.scale_type_id && 
      scale.is_active && 
      companyRiskScales.some(s => 
        s.id === scale.id && 
        s.scale_type_id && 
        scale.scale_type_id === s.scale_type_id &&
        scale.scale_type?.category === 'impact'
      )
    )
  ), [companyRiskScales]);

  const likelihoodScale = useMemo(() => (
    companyRiskScales.find(scale => 
      scale.scale_type_id && 
      scale.is_active && 
      companyRiskScales.some(s => 
        s.id === scale.id && 
        s.scale_type_id && 
        scale.scale_type_id === s.scale_type_id &&
        scale.scale_type?.category === 'likelihood'
      )
    )
  ), [companyRiskScales]);

  // Recueillir les niveaux d'impact et de probabilité disponibles
  const impactLevels = useMemo(() => {
    if (!impactScale?.levels) return [];
    return [...impactScale.levels].sort((a, b) => a.level_value - b.level_value);
  }, [impactScale]);
  
  const likelihoodLevels = useMemo(() => {
    if (!likelihoodScale?.levels) return [];
    return [...likelihoodScale.levels].sort((a, b) => a.level_value - b.level_value);
  }, [likelihoodScale]);

  // Convertir le niveau de risque en index pour le positionner sur la heatmap
  const getRiskLevelIndex = (level: RiskLevel): number => {
    switch (level) {
      case 'low': return 0;
      case 'medium': return 1;
      case 'high': return 2;
      case 'critical': return 3;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full mt-6">
        <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des données de la cartographie...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskScenarios.length) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Cartographie des risques</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Aucun scénario de risque disponible pour générer la cartographie.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!impactScale || !likelihoodScale || !impactLevels.length || !likelihoodLevels.length) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Cartographie des risques</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Les échelles d'impact et de probabilité n'ont pas été configurées correctement.
          </p>
        </CardContent>
      </Card>
    );
  }

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
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Cartographie des risques</CardTitle>
        <Tabs value={displayMode} onValueChange={(v) => setDisplayMode(v as any)} className="w-full">
          <TabsList className="grid w-60 grid-cols-2">
            <TabsTrigger value="side-by-side">Côte à côte</TabsTrigger>
            <TabsTrigger value="stacked">Empilés</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className={`p-6 ${displayMode === 'side-by-side' ? 'grid md:grid-cols-2 gap-6' : 'space-y-6'}`}>
        <div>
          <h3 className="text-lg font-medium mb-4 text-center">Risque Brut</h3>
          <RiskHeatmap 
            scenarios={riskScenarios}
            impactLevels={impactLevels}
            likelihoodLevels={likelihoodLevels}
            type="raw"
            hoveredScenarioId={hoveredScenarioId}
            onHoverScenario={setHoveredScenarioId}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-center">Risque Résiduel</h3>
          <RiskHeatmap 
            scenarios={riskScenarios}
            impactLevels={impactLevels}
            likelihoodLevels={likelihoodLevels}
            type="residual"
            hoveredScenarioId={hoveredScenarioId}
            onHoverScenario={setHoveredScenarioId}
          />
        </div>
      </CardContent>
    </Card>
  );
};
