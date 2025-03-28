
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronsUpDown, Sparkles, Search } from 'lucide-react';
import { useScenarioTemplates } from '@/hooks/useScenarioTemplates';
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

  // Force fetch templates on mount and when dropdown opens
  useEffect(() => {
    if (!templates || templates.length === 0) {
      handleRetry();
    }
  }, [templates, handleRetry]);

  const onTemplateSelect = (template: RiskScenarioTemplate) => {
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
    <Card className="relative">
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
            setOpen(!open);
            if (!open && (!templates || templates.length === 0)) {
              handleRetry();
            }
          }}
        >
          {selectedTemplate
            ? `${selectedTemplate.domain}: ${selectedTemplate.scenario_description.substring(0, 60)}...`
            : "Sélectionner un modèle de scénario..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        
        {open && (
          <div className="absolute z-50 w-full left-0 mt-1 bg-background border rounded-md shadow-md max-h-[300px] overflow-auto">
            <div className="p-2">
              {error ? (
                <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
                    <ChevronsUpDown className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                </div>
              ) : !templates || templates.length === 0 ? (
                <div className="py-6 text-center text-sm flex flex-col items-center gap-2">
                  Aucun modèle disponible
                  <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
                    <ChevronsUpDown className="h-4 w-4 mr-2" />
                    Recharger
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un modèle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="mt-2">
                    {groupedTemplates.length === 0 ? (
                      <div className="py-4 text-center text-sm">
                        Aucun modèle trouvé.
                      </div>
                    ) : (
                      groupedTemplates.map((group) => (
                        <div key={`group-${group.domain}`} className="mb-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1 px-2">
                            {group.domain}
                          </h4>
                          {group.templates.map((template) => (
                            <div
                              key={`template-${template.id}`}
                              className={`flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent ${
                                selectedTemplate?.id === template.id ? 'bg-accent' : ''
                              }`}
                              onClick={() => onTemplateSelect(template)}
                            >
                              {selectedTemplate?.id === template.id && (
                                <span className="mr-2 h-4 w-4 text-primary">✓</span>
                              )}
                              <div className="truncate">{template.scenario_description}</div>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenarioTemplateSelect;
