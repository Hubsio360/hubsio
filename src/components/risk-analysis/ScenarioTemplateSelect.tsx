
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandInput } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronsUpDown, Sparkles } from 'lucide-react';
import { useScenarioTemplates } from '@/hooks/useScenarioTemplates';
import TemplateList from './template-select/TemplateList';
import ErrorState from './template-select/ErrorState';
import EmptyState from './template-select/EmptyState';
import type { RiskScenarioTemplate } from '@/contexts/data/hooks/useRiskScenarioTemplates';

interface ScenarioTemplateSelectProps {
  onSelect: (template: RiskScenarioTemplate) => void;
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
    templates
  } = useScenarioTemplates();

  const onTemplateSelect = (template: RiskScenarioTemplate) => {
    const selected = handleSelectTemplate(template);
    if (selected) {
      onSelect(selected);
    }
  };

  // Show loading state
  if (loading) {
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
      <CardContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              onClick={() => {
                if (!Array.isArray(templates) || templates.length === 0) {
                  handleRetry();
                }
              }}
            >
              {selectedTemplate
                ? `${selectedTemplate.domain}: ${selectedTemplate.scenario_description.substring(0, 60)}...`
                : "Sélectionner un modèle de scénario..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            {error ? (
              <ErrorState error={error} onRetry={handleRetry} />
            ) : !Array.isArray(templates) || templates.length === 0 ? (
              <EmptyState onRetry={handleRetry} />
            ) : (
              <Command>
                <CommandInput 
                  placeholder="Rechercher un modèle..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <div className="max-h-[300px] overflow-y-auto">
                  <TemplateList 
                    groupedTemplates={groupedTemplates}
                    selectedTemplateId={selectedTemplate?.id || null}
                    onSelect={onTemplateSelect}
                    searchTerm={searchTerm}
                  />
                </div>
              </Command>
            )}
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default ScenarioTemplateSelect;
