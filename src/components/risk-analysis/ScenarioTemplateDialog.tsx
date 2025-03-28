
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, AlertCircle, ChevronsUpDown } from 'lucide-react';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ScenarioTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupedTemplates: Array<{
    domain: string;
    templates: EnhancedTemplate[];
  }>;
  onTemplateSelect: (template: EnhancedTemplate) => void;
  selectedTemplate: EnhancedTemplate | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  activeTab: string | null;
  setActiveTab: (tab: string) => void;
}

const ScenarioTemplateDialog: React.FC<ScenarioTemplateDialogProps> = ({
  open,
  onOpenChange,
  groupedTemplates,
  onTemplateSelect,
  selectedTemplate,
  searchTerm,
  onSearchChange,
  loading,
  error,
  onRetry,
  activeTab,
  setActiveTab
}) => {
  const [localSelectedTemplate, setLocalSelectedTemplate] = useState<EnhancedTemplate | null>(null);

  // Reset the local selection when dialog opens/closes
  useEffect(() => {
    if (open) {
      setLocalSelectedTemplate(selectedTemplate);
    }
  }, [open, selectedTemplate]);

  // Set active tab if not set
  useEffect(() => {
    if (groupedTemplates.length > 0 && !activeTab) {
      setActiveTab(groupedTemplates[0].domain);
    }
  }, [groupedTemplates, activeTab, setActiveTab]);

  const handleTemplateClick = (template: EnhancedTemplate) => {
    setLocalSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (localSelectedTemplate) {
      onTemplateSelect(localSelectedTemplate);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sélectionner un modèle de scénario</DialogTitle>
          <DialogDescription>
            Choisissez un scénario prédéfini parmi les modèles disponibles
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un modèle..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {loading && groupedTemplates.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des modèles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" onClick={onRetry} size="sm">
                <ChevronsUpDown className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        ) : groupedTemplates.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Aucun modèle disponible</p>
              <Button variant="outline" onClick={onRetry} size="sm">
                <ChevronsUpDown className="h-4 w-4 mr-2" />
                Recharger
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <Tabs 
              value={activeTab || (groupedTemplates[0]?.domain ?? "")} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <div className="bg-muted rounded-md p-1 mb-4">
                <ScrollArea className="max-w-full">
                  <div className="flex">
                    <TabsList className="inline-flex h-9 whitespace-nowrap">
                      {groupedTemplates.map((group) => (
                        <TabsTrigger
                          key={`tab-${group.domain}`}
                          value={group.domain}
                          className="px-3"
                        >
                          {group.domain}
                          <Badge variant="secondary" className="ml-2">
                            {group.templates.length}
                          </Badge>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </ScrollArea>
              </div>

              <div className="flex-1 overflow-hidden">
                {groupedTemplates.map((group) => (
                  <TabsContent 
                    key={`content-${group.domain}`} 
                    value={group.domain}
                    className="h-full data-[state=active]:flex data-[state=active]:flex-col"
                  >
                    <ScrollArea className="flex-1">
                      <div className="space-y-3 pr-3">
                        {group.templates.map((template) => (
                          <div
                            key={`template-${template.id}`}
                            className={`border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors ${
                              localSelectedTemplate?.id === template.id
                                ? "border-primary bg-accent"
                                : "border-border"
                            }`}
                            onClick={() => handleTemplateClick(template)}
                          >
                            <h4 className="font-medium mb-1">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {template.shortDescription}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        <DialogFooter className="mt-3">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button 
            onClick={handleConfirm} 
            disabled={!localSelectedTemplate}
          >
            Sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioTemplateDialog;
