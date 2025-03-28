
import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/contexts/DataContext';
import { RiskScaleWithLevels, RiskScaleLevel } from '@/types';
import {
  BarChart3,
  Building,
  FileText,
  Shield,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface RiskScalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

const RiskScalesDialog: React.FC<RiskScalesDialogProps> = ({ 
  open, 
  onOpenChange, 
  companyId 
}) => {
  const { fetchCompanyRiskScales, companyRiskScales, loading, toggleRiskScaleActive, updateRiskScaleLevel } = useData();
  const [activeTab, setActiveTab] = useState<string>('financial_impact');
  
  // Load company risk scales when the dialog opens
  useEffect(() => {
    if (open && companyId) {
      fetchCompanyRiskScales(companyId);
    }
  }, [open, companyId, fetchCompanyRiskScales]);

  const handleToggleScale = async (scaleId: string, currentActive: boolean) => {
    await toggleRiskScaleActive(scaleId, !currentActive);
  };

  const handleUpdateLevel = async (level: RiskScaleLevel, updates: Partial<RiskScaleLevel>) => {
    await updateRiskScaleLevel(level.id, updates);
  };

  // Get the icon for each scale type
  const getScaleIcon = (scaleType: string) => {
    switch (scaleType) {
      case 'financial_impact':
        return <BarChart3 className="h-4 w-4" />;
      case 'reputational_impact':
        return <Building className="h-4 w-4" />;
      case 'individual_impact':
        return <FileText className="h-4 w-4" />;
      case 'regulatory_impact':
        return <Shield className="h-4 w-4" />;
      case 'productivity_impact':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Function to get the current scale by type
  const getCurrentScale = () => {
    return companyRiskScales.find(
      scale => scale.scaleType.name === activeTab
    );
  };

  const currentScale = getCurrentScale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configuration des échelles de risque</DialogTitle>
          <DialogDescription>
            Personnalisez les échelles de risque utilisées dans l'analyse des risques pour cette entreprise.
          </DialogDescription>
        </DialogHeader>

        {loading.companyScales ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chargement des échelles...</span>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="border rounded-md p-1 mb-4">
              <TabsList className="w-full grid grid-cols-5">
                {companyRiskScales.map((scale) => (
                  <TabsTrigger
                    key={scale.id}
                    value={scale.scaleType.name}
                    className="flex items-center justify-center py-2"
                  >
                    {getScaleIcon(scale.scaleType.name)}
                    <span className="ml-2">{scale.scaleType.description}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {companyRiskScales.map((scale) => (
              <TabsContent
                key={scale.id}
                value={scale.scaleType.name}
                className="flex-1 flex flex-col space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{scale.scaleType.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      Configurez les niveaux de cette échelle
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`scale-active-${scale.id}`}
                      checked={scale.isActive}
                      onCheckedChange={() => handleToggleScale(scale.id, scale.isActive)}
                    />
                    <Label htmlFor={`scale-active-${scale.id}`}>
                      {scale.isActive ? 'Activée' : 'Désactivée'}
                    </Label>
                  </div>
                </div>

                <Separator />

                <ScrollArea className="flex-1 pb-4">
                  <div className="space-y-6">
                    {scale.levels.sort((a, b) => a.levelValue - b.levelValue).map((level) => (
                      <div
                        key={level.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md"
                        style={{ borderLeftColor: level.color, borderLeftWidth: '4px' }}
                      >
                        <div className="md:col-span-1 flex items-center justify-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: level.color }}
                          >
                            {level.levelValue}
                          </div>
                        </div>
                        
                        <div className="md:col-span-11 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`level-name-${level.id}`}>Nom</Label>
                            <Input
                              id={`level-name-${level.id}`}
                              value={level.name}
                              onChange={(e) => handleUpdateLevel(level, { name: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`level-description-${level.id}`}>Description</Label>
                            <Textarea
                              id={`level-description-${level.id}`}
                              value={level.description}
                              onChange={(e) => handleUpdateLevel(level, { description: e.target.value })}
                              className="h-20 resize-none"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`level-color-${level.id}`}>Couleur</Label>
                            <div className="flex space-x-2">
                              <Input
                                id={`level-color-${level.id}`}
                                type="color"
                                value={level.color}
                                onChange={(e) => handleUpdateLevel(level, { color: e.target.value })}
                                className="w-10 h-10 p-1"
                              />
                              <Input
                                value={level.color}
                                onChange={(e) => handleUpdateLevel(level, { color: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RiskScalesDialog;
