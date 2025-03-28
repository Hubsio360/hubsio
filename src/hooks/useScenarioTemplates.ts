
import { useState, useEffect, useCallback } from 'react';
import { useRiskScenarioTemplates } from '@/contexts/DataContext';
import type { RiskScenarioTemplate } from '@/contexts/data/hooks/useRiskScenarioTemplates';

interface GroupedTemplate {
  domain: string;
  templates: RiskScenarioTemplate[];
}

export const useScenarioTemplates = () => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RiskScenarioTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplate[]>([]);
  
  // Get templates from the hook - ensure we always have arrays
  const { 
    templates: rawTemplates = [], 
    loading, 
    error, 
    fetchRiskScenarioTemplates 
  } = useRiskScenarioTemplates();

  // Ensure templates is always an array
  const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

  // Callback for fetching templates
  const handleRetry = useCallback(async () => {
    console.log("Manually fetching templates...");
    try {
      const fetchedTemplates = await fetchRiskScenarioTemplates();
      console.log(`Fetched ${fetchedTemplates.length} templates`);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  }, [fetchRiskScenarioTemplates]);

  // Load templates on mount
  useEffect(() => {
    handleRetry();
  }, [handleRetry]);

  // Filter and group templates when templates or search term changes
  useEffect(() => {
    if (!templates || !templates.length) {
      setGroupedTemplates([]);
      return;
    }
    
    try {
      console.log(`Processing ${templates.length} templates with search "${searchTerm}"`);
      
      // Filter templates based on search term
      const filtered = templates.filter(template => 
        template && 
        ((template.scenario_description && 
          template.scenario_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (template.domain && 
          template.domain.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      
      // Group templates by domain
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
        .map(([domain, domainTemplates]) => ({
          domain,
          templates: domainTemplates.filter(t => t && t.id && t.scenario_description)
        }))
        .filter(group => group.templates.length > 0)
        .sort((a, b) => a.domain.localeCompare(b.domain));
      
      console.log(`Grouped into ${groupedArray.length} domain groups`);
      setGroupedTemplates(groupedArray);
    } catch (error) {
      console.error('Error grouping templates:', error);
      setGroupedTemplates([]);
    }
  }, [templates, searchTerm]);

  const handleSelectTemplate = (template: RiskScenarioTemplate) => {
    if (template && template.id) {
      console.log(`Selected template: ${template.id} - ${template.domain}`);
      setSelectedTemplate(template);
      setOpen(false);
      return template;
    }
    return null;
  };

  return {
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
  };
};
