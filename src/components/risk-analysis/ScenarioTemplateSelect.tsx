
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronsUpDown, Sparkles } from 'lucide-react';
import { useScenarioTemplates, EnhancedTemplate } from '@/hooks/useScenarioTemplates';
import ScenarioTemplateDialog from './ScenarioTemplateDialog';

interface ScenarioTemplateSelectProps {
  onSelect: (template: EnhancedTemplate) => void;
}

const ScenarioTemplateSelect: React.FC<ScenarioTemplateSelectProps> = ({ onSelect }) => {
  const {
    open,
    setOpen,
    selectedTemplate,
    handleSelectTemplate,
    searchTerm,
    setSearchTerm,
    groupedTemplates,
    loading,
    error,
    handleRetry,
    templates,
    activeTab,
    setActiveTab
  } = useScenarioTemplates();

  // Force fetch templates on mount
  useEffect(() => {
    if (!templates || templates.length === 0) {
      handleRetry();
    }
  }, [templates, handleRetry]);

  const onTemplateSelect = (template: EnhancedTemplate) => {
    const selected = handleSelectTemplate(template);
    if (selected) {
      onSelect(selected);
    }
  };

  // Show loading state
  if (loading && !templates.length) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          Utiliser un modèle
        </CardTitle>
        <CardDescription>
          Sélectionnez un scénario prédéfini pour faciliter la création
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => {
            setOpen(true);
            if (!templates || templates.length === 0) {
              handleRetry();
            }
          }}
        >
          Sélectionner un modèle de scénario
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {selectedTemplate && (
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium mb-1">{selectedTemplate.name}</p>
            <p className="text-muted-foreground text-xs">{selectedTemplate.shortDescription}</p>
          </div>
        )}
        
        <ScenarioTemplateDialog
          open={open}
          onOpenChange={setOpen}
          groupedTemplates={groupedTemplates}
          onTemplateSelect={onTemplateSelect}
          selectedTemplate={selectedTemplate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          loading={loading}
          error={error}
          onRetry={handleRetry}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </CardContent>
    </Card>
  );
};

export default ScenarioTemplateSelect;
