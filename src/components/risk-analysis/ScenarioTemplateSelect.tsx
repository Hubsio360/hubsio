
import React, { useState, useEffect } from 'react';
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

const ScenarioTemplateSelect: React.FC<ScenarioTemplateSelectProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RiskScenarioTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchRiskScenarioTemplates } = useData();
  const [templates, setTemplates] = useState<RiskScenarioTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Function to fetch templates
  const loadTemplates = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const data = await fetchRiskScenarioTemplates();
      
      if (Array.isArray(data) && data.length > 0) {
        const validTemplates = data.filter(
          item => !!item && 
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

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates based on search term
  const filteredTemplates = React.useMemo(() => {
    if (!Array.isArray(templates) || templates.length === 0) return [];
    
    return templates.filter(template => 
      template.scenario_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  // Group templates by domain
  const groupedTemplates = React.useMemo(() => {
    if (!Array.isArray(filteredTemplates) || filteredTemplates.length === 0) {
      return [];
    }
    
    try {
      const groups: Record<string, RiskScenarioTemplate[]> = {};
      
      // First group templates by domain
      for (const template of filteredTemplates) {
        if (template && template.domain) {
          if (!groups[template.domain]) {
            groups[template.domain] = [];
          }
          groups[template.domain].push(template);
        }
      }
      
      // Convert to array and sort
      return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([domain, templates]) => ({
          domain,
          templates: templates.filter(t => t && t.id && t.scenario_description)
        }))
        .filter(group => group.templates.length > 0);
    } catch (error) {
      console.error('Error grouping templates:', error);
      return [];
    }
  }, [filteredTemplates]);

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
