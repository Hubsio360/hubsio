
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

      setTemplates(data || []);
      return data || [];
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

      return data || [];
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
