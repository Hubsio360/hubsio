
import React from 'react';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskScenarioTemplate } from '@/contexts/data/hooks/useRiskScenarioTemplates';

interface GroupedTemplate {
  domain: string;
  templates: RiskScenarioTemplate[];
}

interface TemplateListProps {
  groupedTemplates: GroupedTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: RiskScenarioTemplate) => void;
  searchTerm: string;
}

const TemplateList: React.FC<TemplateListProps> = ({ 
  groupedTemplates, 
  selectedTemplateId, 
  onSelect, 
  searchTerm 
}) => {
  if (!groupedTemplates || groupedTemplates.length === 0) {
    return <CommandEmpty>Aucun modèle trouvé.</CommandEmpty>;
  }

  return (
    <>
      {groupedTemplates.map((group) => (
        <CommandGroup key={`group-${group.domain}`} heading={group.domain}>
          {group.templates.map((template) => (
            <CommandItem
              key={`template-${template.id}`}
              value={template.id}
              onSelect={() => onSelect(template)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedTemplateId === template.id ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="truncate">{template.scenario_description}</div>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
};

export default TemplateList;
