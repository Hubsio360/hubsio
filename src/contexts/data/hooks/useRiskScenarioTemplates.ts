
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRiskScenarioTemplates = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchRiskScenarioTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('risk_scenarios_templates')
        .select('*')
        .order('domain', { ascending: true });

      if (error) {
        console.error('Error fetching risk scenario templates:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format returned from supabase:', data);
        return [];
      }

      // Validate each template
      const validTemplates = data.filter(template => 
        template && 
        typeof template === 'object' && 
        typeof template.id === 'string' && 
        typeof template.scenario_description === 'string' &&
        typeof template.domain === 'string'
      );

      setTemplates(validTemplates);
      return validTemplates;
    } catch (error) {
      console.error('Exception when fetching risk scenario templates:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRiskScenarioTemplatesByDomain = async (domain: string) => {
    try {
      const { data, error } = await supabase
        .from('risk_scenarios_templates')
        .select('*')
        .ilike('domain', `%${domain}%`)
        .order('domain', { ascending: true });

      if (error) {
        console.error('Error fetching risk scenario templates by domain:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.filter(template => 
        template && 
        typeof template === 'object' && 
        typeof template.id === 'string' && 
        typeof template.scenario_description === 'string' &&
        typeof template.domain === 'string'
      );
    } catch (error) {
      console.error('Exception when fetching risk scenario templates by domain:', error);
      return [];
    }
  };

  return {
    templates,
    loading,
    fetchRiskScenarioTemplates,
    getRiskScenarioTemplatesByDomain
  };
};
