
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RiskScenarioTemplate = {
  id: string;
  domain: string;
  scenario_description: string;
};

export const useRiskScenarioTemplates = () => {
  const [riskScenarioTemplates, setRiskScenarioTemplates] = useState<RiskScenarioTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all risk scenario templates
  const fetchRiskScenarioTemplates = useCallback(async (): Promise<RiskScenarioTemplate[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('risk_scenarios_templates')
        .select('*')
        .order('domain');
      
      if (supabaseError) {
        console.error('Error fetching risk scenario templates:', supabaseError);
        setError(supabaseError.message);
        return [];
      }
      
      setRiskScenarioTemplates(data || []);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching risk scenario templates:', err);
      setError(errorMessage);
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
    error,
    fetchRiskScenarioTemplates,
    getRiskScenarioTemplatesByDomain
  };
};
