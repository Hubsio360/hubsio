
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
  onSelect: (template: any) => void;
}

const ScenarioTemplateSelect: React.FC<ScenarioTemplateSelectProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchRiskScenarioTemplates } = useData();

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await fetchRiskScenarioTemplates();
        setTemplates(data || []);
      } catch (error) {
        console.error('Error loading scenario templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, [fetchRiskScenarioTemplates]);

  // Get unique domains
  const domains = Array.from(new Set(templates.map(template => template.domain)));

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setOpen(false);
    onSelect(template);
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
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
            >
              {selectedTemplate
                ? `${selectedTemplate.domain}: ${selectedTemplate.scenario_description.substring(0, 60)}...`
                : "Sélectionner un modèle de scénario..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Rechercher un modèle..." />
              <CommandEmpty>Aucun modèle trouvé.</CommandEmpty>
              {domains.map(domain => (
                <CommandGroup key={domain} heading={domain}>
                  {templates
                    .filter(template => template.domain === domain)
                    .map(template => (
                      <CommandItem
                        key={template.id}
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
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default ScenarioTemplateSelect;
