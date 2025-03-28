
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioTemplateSelectProps {
  onSelect: (template: RiskScenarioTemplate) => void;
}

// Define a type for the risk scenario template
interface RiskScenarioTemplate {
  id: string;
  domain: string;
  scenario_description: string;
}

// Define a type for the grouped templates
interface GroupedTemplates {
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

  // Use a stable reference for the loadTemplates function
  const loadTemplates = async () => {
    if (!isLoading && templates.length > 0) return; // Avoid unnecessary fetches
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const data = await fetchRiskScenarioTemplates();
      
      // Safely handle the data and validate it
      if (Array.isArray(data) && data.length > 0) {
        // Filter out any invalid templates
        const validTemplates = data.filter(
          (item): item is RiskScenarioTemplate => 
            !!item && 
            typeof item === 'object' && 
            typeof item.id === 'string' && 
            typeof item.scenario_description === 'string' &&
            typeof item.domain === 'string'
        );
        
        setTemplates(validTemplates);
        console.log('Templates loaded successfully:', validTemplates.length);
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

  // Only fetch templates once on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Memoize filtered templates to prevent unnecessary recalculations
  const filteredTemplates = useMemo(() => {
    if (!templates || !templates.length) return [];
    
    return templates.filter(template => 
      template.scenario_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  // Group templates by domain, sorted alphabetically - also memoized
  const groupedTemplates = useMemo(() => {
    if (!filteredTemplates || !filteredTemplates.length) return [];
    
    const groups: Record<string, RiskScenarioTemplate[]> = {};
    
    // First create groups with valid domains only
    for (const template of filteredTemplates) {
      if (template && template.domain) {
        const domainKey = template.domain;
        if (!groups[domainKey]) {
          groups[domainKey] = [];
        }
        groups[domainKey].push(template);
      }
    }
    
    // Create array of grouped templates
    return Object.entries(groups)
      .sort(([domainA], [domainB]) => domainA.localeCompare(domainB))
      .map(([domain, domainTemplates]) => ({ 
        domain, 
        templates: domainTemplates.filter(t => t && t.id && t.scenario_description) 
      }))
      .filter(group => group.templates.length > 0); // Only include groups with templates
  }, [filteredTemplates]);

  const handleSelectTemplate = (template: RiskScenarioTemplate) => {
    if (template && template.id) {
      setSelectedTemplate(template);
      setOpen(false);
      onSelect(template);
    }
  };

  // Show a skeleton while loading, with a key to prevent flickering
  if (isLoading) {
    return (
      <Card key="loading-skeleton">
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
                // Refresh templates if needed
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
              <div className="py-6 text-center text-sm text-muted-foreground">{loadError}</div>
            ) : templates.length === 0 ? (
              <div className="py-6 text-center text-sm">Chargement des modèles...</div>
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
