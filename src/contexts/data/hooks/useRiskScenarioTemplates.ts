
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RiskScenarioTemplate = {
  id: string;
  domain: string;
  scenario_description: string;
};

export const useRiskScenarioTemplates = () => {
  const [riskScenarioTemplates, setRiskScenarioTemplates] = useState<RiskScenarioTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all risk scenario templates
  const fetchRiskScenarioTemplates = useCallback(async (): Promise<RiskScenarioTemplate[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('risk_scenarios_templates')
        .select('*')
        .order('domain');
      
      if (error) {
        console.error('Error fetching risk scenario templates:', error);
        return [];
      }
      
      setRiskScenarioTemplates(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching risk scenario templates:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get templates filtered by domain
  const getRiskScenarioTemplatesByDomain = useCallback((domain: string): RiskScenarioTemplate[] => {
    return riskScenarioTemplates.filter(template => template.domain === domain);
  }, [riskScenarioTemplates]);

  return {
    riskScenarioTemplates,
    loading,
    fetchRiskScenarioTemplates,
    getRiskScenarioTemplatesByDomain
  };
};
