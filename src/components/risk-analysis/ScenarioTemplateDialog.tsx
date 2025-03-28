
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
import { Search, AlertCircle, ChevronsUpDown } from 'lucide-react';
import { EnhancedTemplate, GroupedTemplate } from '@/hooks/useScenarioTemplates';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ScenarioTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupedTemplates: GroupedTemplate[];
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
  const [filteredGroups, setFilteredGroups] = useState<GroupedTemplate[]>(groupedTemplates);

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

  // Filter templates based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGroups(groupedTemplates);
      return;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = groupedTemplates.map(group => {
      const filteredTemplates = group.templates.filter(template => 
        template.name.toLowerCase().includes(lowercaseSearch) || 
        template.shortDescription.toLowerCase().includes(lowercaseSearch) ||
        template.domain.toLowerCase().includes(lowercaseSearch)
      );
      return { ...group, templates: filteredTemplates };
    }).filter(group => group.templates.length > 0);

    setFilteredGroups(filtered);
  }, [searchTerm, groupedTemplates]);

  const handleTemplateClick = (template: EnhancedTemplate) => {
    setLocalSelectedTemplate(template);
  };

  const handleDomainClick = (domain: string) => {
    setActiveTab(domain);
  };

  const handleConfirm = () => {
    if (localSelectedTemplate) {
      onTemplateSelect(localSelectedTemplate);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[80vh] flex flex-col">
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
        ) : filteredGroups.length === 0 ? (
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
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar with domains */}
            <div className="w-1/3 border-r pr-2 overflow-hidden">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-1">
                  {filteredGroups.map((group) => (
                    <Button
                      key={`domain-${group.domain}`}
                      variant={activeTab === group.domain ? "secondary" : "ghost"}
                      className="w-full justify-between text-left"
                      onClick={() => handleDomainClick(group.domain)}
                    >
                      <span className="truncate">{group.domain}</span>
                      <Badge variant="outline" className="ml-2">
                        {group.templates.length}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Right content with templates */}
            <div className="flex-1 overflow-hidden pl-3">
              <ScrollArea className="h-full">
                <div className="space-y-3 pr-3">
                  {activeTab && filteredGroups.find(g => g.domain === activeTab)?.templates.map((template) => (
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
            </div>
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
