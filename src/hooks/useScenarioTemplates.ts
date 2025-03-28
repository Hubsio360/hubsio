
import { useState, useEffect, useCallback } from 'react';
import { useRiskScenarioTemplates } from '@/contexts/DataContext';
import type { RiskScenarioTemplate } from '@/contexts/data/hooks/useRiskScenarioTemplates';

// Interface for the templates grouped by domain
export interface GroupedTemplate {
  domain: string;
  templates: EnhancedTemplate[];
}

// Interface for the templates with name and description separated
export interface EnhancedTemplate extends RiskScenarioTemplate {
  name: string;
  shortDescription: string;
}

export const useScenarioTemplates = () => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplate[]>([]);
  const [enhancedTemplates, setEnhancedTemplates] = useState<EnhancedTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // Get templates from the context hook
  const { 
    templates: rawTemplates = [], 
    loading, 
    error, 
    fetchRiskScenarioTemplates 
  } = useRiskScenarioTemplates();

  // Ensure templates is always an array
  const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

  // Process templates to separate name and description
  const processTemplates = useCallback((templatesArray: RiskScenarioTemplate[]): EnhancedTemplate[] => {
    return templatesArray.map(template => {
      // Try to extract a name from the scenario_description
      let name = template.scenario_description;
      let shortDescription = '';
      
      // Try to identify if there's a colon or period to separate title from description
      if (name.includes(':')) {
        const parts = name.split(':');
        name = parts[0].trim();
        shortDescription = parts.slice(1).join(':').trim();
      } else if (name.includes('.') && name.indexOf('.') < 100) {
        const parts = name.split('.');
        name = parts[0].trim();
        shortDescription = parts.slice(1).join('.').trim();
      } else if (name.length > 60) {
        name = name.substring(0, 60) + '...';
        shortDescription = template.scenario_description;
      } else {
        shortDescription = template.scenario_description;
      }
      
      return {
        ...template,
        name,
        shortDescription
      };
    });
  }, []);

  // Callback for fetching templates - prevent infinite useEffect loops
  const handleRetry = useCallback(async () => {
    console.log("Manually fetching templates...");
    try {
      const fetchedTemplates = await fetchRiskScenarioTemplates();
      console.log(`Fetched ${fetchedTemplates.length} templates`);
      
      // Process templates to extract names and descriptions
      const processed = processTemplates(fetchedTemplates);
      setEnhancedTemplates(processed);
      
      return fetchedTemplates;
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      return [];
    }
  }, [fetchRiskScenarioTemplates, processTemplates]);

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
      
      // Process templates to have proper name and description
      const processed = processTemplates(templates);
      setEnhancedTemplates(processed);
      
      // Filter templates based on search term
      const filtered = processed.filter(template => 
        template && 
        ((template.name && 
          template.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (template.shortDescription && 
          template.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (template.domain && 
          template.domain.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      
      // Group templates by domain
      const groups: Record<string, EnhancedTemplate[]> = {};
      
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
          templates: domainTemplates.filter(t => t && t.id)
        }))
        .filter(group => group.templates.length > 0)
        .sort((a, b) => a.domain.localeCompare(b.domain));
      
      console.log(`Grouped into ${groupedArray.length} domain groups`);
      setGroupedTemplates(groupedArray);
      
      // Set active tab to the first domain if no active tab
      if (groupedArray.length > 0 && !activeTab) {
        setActiveTab(groupedArray[0].domain);
      }
    } catch (error) {
      console.error('Error grouping templates:', error);
      setGroupedTemplates([]);
    }
  }, [templates, searchTerm, processTemplates, activeTab]);

  const handleSelectTemplate = (template: EnhancedTemplate) => {
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
    enhancedTemplates,
    loading,
    error,
    handleRetry,
    templates,
    activeTab,
    setActiveTab
  };
};
