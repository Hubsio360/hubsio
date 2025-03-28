
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ChevronsUpDown, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskScenarioTemplate } from '@/contexts/data/hooks/useRiskScenarioTemplates';

interface ScenarioTemplateSelectProps {
  onSelect: (template: RiskScenarioTemplate) => void;
}

interface GroupedTemplate {
  domain: string;
  templates: RiskScenarioTemplate[];
}

const ScenarioTemplateSelect: React.FC<ScenarioTemplateSelectProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RiskScenarioTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchRiskScenarioTemplates } = useData();
  const [templates, setTemplates] = useState<RiskScenarioTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplate[]>([]);

  // Function to fetch templates
  const loadTemplates = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const data = await fetchRiskScenarioTemplates();
      
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(data);
        console.log('Templates loaded successfully:', data.length);
      } else {
        console.error('No valid templates returned:', data);
        setTemplates([]);
        setLoadError('Aucun modèle disponible');
      }
    } catch (error) {
      console.error('Error loading scenario templates:', error);
      setTemplates([]);
      setLoadError('Erreur lors du chargement des modèles');
    } finally {
      setIsLoading(false);
    }
  };

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates based on search term
  useEffect(() => {
    if (!Array.isArray(templates) || templates.length === 0) {
      setGroupedTemplates([]);
      return;
    }
    
    const filtered = templates.filter(template => 
      template && 
      template.scenario_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    try {
      const groups: Record<string, RiskScenarioTemplate[]> = {};
      
      // First group templates by domain
      for (const template of filtered) {
        if (template && template.domain) {
          if (!groups[template.domain]) {
            groups[template.domain] = [];
          }
          groups[template.domain].push(template);
        }
      }
      
      // Convert to array and sort
      const groupedArray = Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([domain, domainTemplates]) => ({
          domain,
          templates: domainTemplates.filter(t => t && t.id && t.scenario_description)
        }))
        .filter(group => group.templates.length > 0);
      
      setGroupedTemplates(groupedArray);
    } catch (error) {
      console.error('Error grouping templates:', error);
      setGroupedTemplates([]);
    }
  }, [templates, searchTerm]);

  // Handle template selection
  const handleSelectTemplate = (template: RiskScenarioTemplate) => {
    if (template && template.id) {
      setSelectedTemplate(template);
      setOpen(false);
      onSelect(template);
    }
  };

  // Show loading state
  if (isLoading) {
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
                if (templates.length === 0 && !isLoading) {
                  loadTemplates();
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
            {loadError ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <span>{loadError}</span>
                <Button variant="outline" size="sm" onClick={loadTemplates} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : templates.length === 0 ? (
              <div className="py-6 text-center text-sm flex flex-col items-center gap-2">
                Chargement des modèles...
                <Button variant="outline" size="sm" onClick={loadTemplates} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recharger
                </Button>
              </div>
            ) : (
              <Command>
                <CommandInput 
                  placeholder="Rechercher un modèle..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                {!groupedTemplates || groupedTemplates.length === 0 ? (
                  <CommandEmpty>Aucun modèle trouvé.</CommandEmpty>
                ) : (
                  <>
                    {groupedTemplates.map((group) => (
                      <CommandGroup key={`group-${group.domain}`} heading={group.domain}>
                        {group.templates.map((template) => (
                          <CommandItem
                            key={`template-${template.id}`}
                            value={template.id}
                            onSelect={() => handleSelectTemplate(template)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTemplate?.id === template.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="truncate">{template.scenario_description}</div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </>
                )}
              </Command>
            )}
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default ScenarioTemplateSelect;
