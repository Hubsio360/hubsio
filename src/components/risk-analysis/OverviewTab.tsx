
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, FolderOpen, FileText, ShieldOff } from 'lucide-react';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskScenario } from '@/types';
import { RiskHeatmapComparison } from './RiskHeatmapComparison';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface OverviewTabProps {
  isLoading: boolean;
  riskScenarios: RiskScenario[];
  criticalScenarios: number;
  highScenarios: number;
  mediumScenarios: number;
  lowScenarios: number;
  onTabChange: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  isLoading,
  riskScenarios,
  criticalScenarios,
  highScenarios,
  mediumScenarios,
  lowScenarios,
  onTabChange,
}) => {
  const data = [
    { name: 'Critique', value: criticalScenarios, color: '#ef4444' },
    { name: 'Élevé', value: highScenarios, color: '#f97316' },
    { name: 'Moyen', value: mediumScenarios, color: '#eab308' },
    { name: 'Faible', value: lowScenarios, color: '#22c55e' },
  ];

  return (
    <div className="space-y-8">
      {/* Distribution des risques par niveau */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Répartition des risques par niveau</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            ) : (
              <ChartContainer config={{ 
                critical: { label: 'Critique' }, 
                high: { label: 'Élevé' },
                medium: { label: 'Moyen' }, 
                low: { label: 'Faible' } 
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent>
                              {payload.map(({ name, value, payload: p }) => (
                                <div
                                  key={name}
                                  className="flex items-center justify-between gap-8"
                                >
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{ background: p.color }}
                                    />
                                    <span className="text-muted-foreground">{p.name}</span>
                                  </div>
                                  <div className="font-medium tabular-nums">{value}</div>
                                </div>
                              ))}
                            </ChartTooltipContent>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Risques prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {riskScenarios
                  .filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high')
                  .sort((a, b) => {
                    const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return levelOrder[a.riskLevel as keyof typeof levelOrder] - levelOrder[b.riskLevel as keyof typeof levelOrder];
                  })
                  .slice(0, 5)
                  .map(scenario => (
                    <div key={scenario.id} className="flex items-start gap-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                      <div className="mt-0.5">
                        <ShieldOff className={`h-5 w-5 ${
                          scenario.riskLevel === 'critical' ? 'text-red-500' :
                          scenario.riskLevel === 'high' ? 'text-orange-500' :
                          scenario.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{scenario.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {scenario.description || "Pas de description"}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        scenario.riskLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        scenario.riskLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        scenario.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {scenario.riskLevel === 'critical' ? 'Critique' :
                         scenario.riskLevel === 'high' ? 'Élevé' :
                         scenario.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                      </div>
                    </div>
                  ))}
                  
                {(criticalScenarios === 0 && highScenarios === 0) && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ShieldOff className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-muted-foreground mb-2">Aucun risque critique ou élevé identifié</p>
                    <Button variant="outline" onClick={() => onTabChange('scenarios')}>
                      Voir tous les risques
                    </Button>
                  </div>
                )}
                
                {(criticalScenarios > 0 || highScenarios > 0) && (
                  <Button variant="outline" className="w-full" onClick={() => onTabChange('scenarios')}>
                    Voir tous les risques prioritaires
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Nouvelle section: Cartographie des risques */}
      <RiskHeatmapComparison 
        riskScenarios={riskScenarios} 
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <Button variant="outline" className="w-full" onClick={() => onTabChange('assets')}>
                  <Layers className="mr-2 h-4 w-4" />
                  Gérer les actifs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Menaces</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <Button variant="outline" className="w-full" onClick={() => onTabChange('threats')}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Gérer les menaces
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vulnérabilités</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <Button variant="outline" className="w-full" onClick={() => onTabChange('vulnerabilities')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Gérer les vulnérabilités
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
