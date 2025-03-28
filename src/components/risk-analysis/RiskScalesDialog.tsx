
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { useRiskScalesManager } from '@/hooks/useRiskScalesManager';
import RiskScaleCard from '@/components/risk-analysis/RiskScaleCard';
import { RiskScaleType } from '@/types';

interface RiskScalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

const RiskScalesDialog: React.FC<RiskScalesDialogProps> = ({
  open,
  onOpenChange,
  companyId,
}) => {
  const [selectedScaleType, setSelectedScaleType] = useState<string>('');
  const [activeTab, setActiveTab] = useState('impact');
  
  // Get scale type details - defined BEFORE it's used
  const getScaleType = (scaleTypeId: string): RiskScaleType => {
    return riskScaleTypes.find(type => type.id === scaleTypeId) || {
      id: '',
      name: 'Type inconnu',
      description: ''
    };
  };
  
  const {
    riskScaleTypes,
    companyRiskScales,
    isLoading,
    isRefreshing,
    error,
    addScale,
    toggleActive,
    updateLevel,
    refreshData
  } = useRiskScalesManager(companyId);

  // Helper function to get scaleTypeId regardless of naming convention
  const getScaleTypeId = (scale: any): string => {
    return scale.scaleTypeId || scale.scale_type_id || '';
  };

  // Group company risk scales by type
  const impactScales = companyRiskScales.filter(
    (scale) => {
      const scaleType = getScaleType(getScaleTypeId(scale));
      return scaleType && !scaleType.name.includes('likelihood');
    }
  );
  
  const likelihoodScales = companyRiskScales.filter(
    (scale) => {
      const scaleType = getScaleType(getScaleTypeId(scale));
      return scaleType && scaleType.name.includes('likelihood');
    }
  );

  // Filter risk scale types that haven't been added to the company yet
  const availableScaleTypes = riskScaleTypes.filter(
    (type) => !companyRiskScales.some((scale) => getScaleTypeId(scale) === type.id)
  );

  // Handle adding a new scale type to the company
  const handleAddScale = async () => {
    if (selectedScaleType) {
      await addScale(selectedScaleType);
      setSelectedScaleType('');
    }
  };

  // Get levels for a scale
  const getLevelsForScale = (scaleId: string) => {
    const scale = companyRiskScales.find(s => s.id === scaleId);
    return scale?.levels || [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Échelles de risque</DialogTitle>
          <DialogDescription>
            Configurez les échelles de risque utilisées pour évaluer les scénarios de risque
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Select value={selectedScaleType} onValueChange={setSelectedScaleType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner une échelle à ajouter" />
            </SelectTrigger>
            <SelectContent>
              {availableScaleTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddScale} disabled={!selectedScaleType || isLoading}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="impact">Échelles d'impact</TabsTrigger>
            <TabsTrigger value="likelihood">Échelles de probabilité</TabsTrigger>
          </TabsList>

          <TabsContent value="impact" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-220px)]">
              <div className="pr-4 space-y-4">
                {impactScales.length === 0 && !isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune échelle d'impact configurée. Ajoutez-en une depuis le menu ci-dessus.
                  </div>
                ) : (
                  impactScales.map((scale) => (
                    <RiskScaleCard
                      key={scale.id}
                      companyScale={scale}
                      scaleType={getScaleType(getScaleTypeId(scale))}
                      levels={getLevelsForScale(scale.id)}
                      isLoading={isLoading}
                      onToggleActive={toggleActive}
                      onUpdateLevel={updateLevel}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="likelihood" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-220px)]">
              <div className="pr-4 space-y-4">
                {likelihoodScales.length === 0 && !isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune échelle de probabilité configurée. Ajoutez-en une depuis le menu ci-dessus.
                  </div>
                ) : (
                  likelihoodScales.map((scale) => (
                    <RiskScaleCard
                      key={scale.id}
                      companyScale={scale}
                      scaleType={getScaleType(getScaleTypeId(scale))}
                      levels={getLevelsForScale(scale.id)}
                      isLoading={isLoading}
                      onToggleActive={toggleActive}
                      onUpdateLevel={updateLevel}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskScalesDialog;
