
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
  Clock,
  AlertCircle
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { 
    fetchCompanyRiskScales, 
    companyRiskScales, 
    loading, 
    toggleRiskScaleActive, 
    updateRiskScaleLevel, 
    setupLikelihoodScale 
  } = useData();
  const [activeTab, setActiveTab] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load company risk scales when the dialog opens
  useEffect(() => {
    if (open && companyId) {
      const loadScales = async () => {
        setIsInitialLoading(true);
        setError(null);
        try {
          // First fetch existing scales
          await fetchCompanyRiskScales(companyId);
          
          // Then try to setup the likelihood scale if needed
          // We don't await this to prevent blocking
          setupLikelihoodScale(companyId).catch(err => {
            console.error('Non-blocking error setting up likelihood scale:', err);
            // We don't set an error here as it's non-critical
          });
        } catch (err) {
          console.error('Error loading scales:', err);
          setError("Impossible de charger les échelles de risque. Veuillez réessayer.");
        } finally {
          setIsInitialLoading(false);
        }
      };
      
      loadScales();
    }
  }, [open, companyId, fetchCompanyRiskScales, setupLikelihoodScale]);

  // Set active tab when scales are loaded
  useEffect(() => {
    if (companyRiskScales && companyRiskScales.length > 0 && !activeTab) {
      setActiveTab(companyRiskScales[0].scaleType.name);
    }
  }, [companyRiskScales, activeTab]);

  const handleToggleScale = async (scaleId: string, currentActive: boolean) => {
    try {
      await toggleRiskScaleActive(scaleId, !currentActive);
    } catch (err) {
      console.error('Error toggling scale:', err);
      setError("Impossible de modifier le statut de l'échelle.");
    }
  };

  const handleUpdateLevel = async (level: RiskScaleLevel, updates: Partial<RiskScaleLevel>) => {
    try {
      await updateRiskScaleLevel(level.id, updates);
      setError(null);
    } catch (err) {
      console.error('Error updating level:', err);
      setError("Impossible de mettre à jour le niveau.");
    }
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
      case 'likelihood':
        return <Clock className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const renderSkeletonTabs = () => (
    <div className="w-full space-y-4">
      <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-16 rounded-md" />
        ))}
      </div>
      <Separator />
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-md" />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (isInitialLoading) {
      return renderSkeletonTabs();
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!companyRiskScales || companyRiskScales.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucune échelle de risque</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            Aucune échelle de risque n'a été configurée pour cette entreprise.
          </p>
        </div>
      );
    }

    return (
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
          {companyRiskScales.map((scale) => (
            <TabsTrigger
              key={scale.id}
              value={scale.scaleType.name}
              className="py-2 px-3 flex flex-col items-center justify-center gap-1 h-auto"
            >
              {getScaleIcon(scale.scaleType.name)}
              <span className="text-xs text-center line-clamp-2">{scale.scaleType.description}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {companyRiskScales.map((scale) => (
          <TabsContent
            key={scale.id}
            value={scale.scaleType.name}
            className="flex-1 flex flex-col space-y-4 mt-4"
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

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-6">
                {scale.levels.sort((a, b) => a.levelValue - b.levelValue).map((level) => (
                  <div
                    key={level.id}
                    className="border rounded-md overflow-hidden"
                    style={{ borderLeftColor: level.color, borderLeftWidth: '4px' }}
                  >
                    <div className="bg-muted/30 p-3 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.levelValue}
                      </div>
                      <div className="flex-1">
                        <Input
                          id={`level-name-${level.id}`}
                          value={level.name}
                          onChange={(e) => handleUpdateLevel(level, { name: e.target.value })}
                          className="text-sm font-medium bg-background"
                          placeholder="Nom du niveau"
                        />
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Input
                          id={`level-color-${level.id}`}
                          type="color"
                          value={level.color}
                          onChange={(e) => handleUpdateLevel(level, { color: e.target.value })}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <Label htmlFor={`level-description-${level.id}`} className="text-xs text-muted-foreground mb-1 block">
                        Description
                      </Label>
                      <Textarea
                        id={`level-description-${level.id}`}
                        value={level.description}
                        onChange={(e) => handleUpdateLevel(level, { description: e.target.value })}
                        className="min-h-[80px] resize-none"
                        placeholder="Description détaillée du niveau de risque"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configuration des échelles de risque</DialogTitle>
          <DialogDescription>
            Personnalisez les échelles de risque utilisées dans l'analyse des risques pour cette entreprise.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RiskScalesDialog;
