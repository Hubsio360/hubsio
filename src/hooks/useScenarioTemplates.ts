
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScenarioTemplate {
  id: string;
  domain: string;
  scenario_description: string;
}

export interface EnhancedTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  category?: string;
  shortDescription?: string;
}

export interface GroupedTemplate {
  domain: string;
  templates: EnhancedTemplate[];
}

export const useScenarioTemplates = () => {
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [enhancedTemplates, setEnhancedTemplates] = useState<EnhancedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplate[]>([]);

  // Fonction pour récupérer les modèles de scénarios de risque
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching scenario templates from database...');
      const { data, error } = await supabase
        .from('risk_scenarios_templates')
        .select('*')
        .order('domain');
      
      if (error) {
        console.error('Error fetching templates:', error);
        setError(`Erreur: ${error.message}`);
        setLoading(false);
        return;
      }
      
      if (!data) {
        console.log('No templates found');
        setTemplates([]);
        setEnhancedTemplates([]);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${data.length} templates`);
      setTemplates(data as ScenarioTemplate[]);
      
      // Améliorer les templates pour l'affichage
      const enhanced = data.map((template: ScenarioTemplate): EnhancedTemplate => {
        // Extraire un nom plus court à partir de la description du scénario
        const name = extractNameFromDescription(template.scenario_description);
        return {
          id: template.id,
          name: name,
          description: template.scenario_description,
          shortDescription: truncateDescription(template.scenario_description, 150),
          domain: template.domain,
          category: getCategoryFromDomain(template.domain)
        };
      });
      
      setEnhancedTemplates(enhanced);
      
      // Grouper les templates par domaine
      const grouped = groupTemplatesByDomain(enhanced);
      setGroupedTemplates(grouped);
      
      // Définir l'onglet actif par défaut s'il n'y en a pas
      if (grouped.length > 0 && !activeTab) {
        setActiveTab(grouped[0].domain);
      }
      
    } catch (err) {
      console.error('Exception in fetchTemplates:', err);
      setError('Erreur lors de la récupération des modèles de scénarios');
    } finally {
      setLoading(false);
    }
  };

  // Extraire un nom à partir de la description
  const extractNameFromDescription = (description: string): string => {
    // Si la description est vide, retourner un texte par défaut
    if (!description) return 'Scénario sans description';
    
    // Limiter le nom à la première phrase ou aux 60 premiers caractères
    const firstSentence = description.split('.')[0];
    if (firstSentence.length <= 60) return firstSentence;
    
    return firstSentence.substring(0, 57) + '...';
  };

  // Tronquer la description pour l'affichage court
  const truncateDescription = (description: string, maxLength: number): string => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    
    return description.substring(0, maxLength) + '...';
  };

  // Grouper les templates par domaine
  const groupTemplatesByDomain = (templates: EnhancedTemplate[]): GroupedTemplate[] => {
    const groupedMap = templates.reduce((acc, template) => {
      if (!acc[template.domain]) {
        acc[template.domain] = [];
      }
      acc[template.domain].push(template);
      return acc;
    }, {} as Record<string, EnhancedTemplate[]>);
    
    return Object.entries(groupedMap).map(([domain, templates]) => ({
      domain,
      templates
    }));
  };

  // Déterminer une catégorie à partir du domaine
  const getCategoryFromDomain = (domain: string): string => {
    domain = domain.toLowerCase();
    
    if (domain.includes('technique') || domain.includes('technical')) 
      return 'technical';
    if (domain.includes('organisation') || domain.includes('organization')) 
      return 'organizational';
    if (domain.includes('humain') || domain.includes('human')) 
      return 'human';
    if (domain.includes('physique') || domain.includes('physical')) 
      return 'physical';
    if (domain.includes('environnement') || domain.includes('environment')) 
      return 'environmental';
    
    return 'technical'; // Valeur par défaut
  };

  // Gérer la sélection d'un template
  const handleSelectTemplate = useCallback((template: EnhancedTemplate): EnhancedTemplate => {
    setSelectedTemplate(template);
    return template;
  }, []);

  // Fonction de réessai pour les erreurs
  const handleRetry = useCallback(() => {
    fetchTemplates();
  }, []);

  // Charger les templates au montage du composant
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    enhancedTemplates,
    loading,
    error,
    open,
    setOpen,
    selectedTemplate,
    handleSelectTemplate,
    searchTerm,
    setSearchTerm,
    groupedTemplates,
    activeTab,
    setActiveTab,
    refreshTemplates: fetchTemplates,
    handleRetry
  };
};
