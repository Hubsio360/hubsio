
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
  onSelect: (template: any) => void;
}

const ScenarioTemplateSelect: React.FC<ScenarioTemplateSelectProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchRiskScenarioTemplates } = useData();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => 
      template.scenario_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  // Group templates by domain, sorted alphabetically
  const groupedTemplates = useMemo(() => {
    const groups = filteredTemplates.reduce((acc, template) => {
      if (!acc[template.domain]) {
        acc[template.domain] = [];
      }
      acc[template.domain].push(template);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groups)
      .sort(([domainA], [domainB]) => domainA.localeCompare(domainB))
      .map(([domain, domainTemplates]) => ({ domain, templates: domainTemplates }));
  }, [filteredTemplates]);

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
              <CommandInput 
                placeholder="Rechercher un modèle..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandEmpty>Aucun modèle trouvé.</CommandEmpty>
              {groupedTemplates.map(({ domain, templates }) => (
                <CommandGroup key={domain} heading={domain}>
                  {templates.map(template => (
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
