
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RiskScenarioTemplate {
  id: string;
  domain: string;
  scenario_description: string;
}

export const useRiskScenarioTemplates = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [templates, setTemplates] = useState<RiskScenarioTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskScenarioTemplates = async (): Promise<RiskScenarioTemplate[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching risk scenario templates...');
      const { data, error } = await supabase
        .from('risk_scenarios_templates')
        .select('*')
        .order('domain', { ascending: true });

      if (error) {
        console.error('Error fetching risk scenario templates:', error);
        setError(`Erreur: ${error.message}`);
        setTemplates([]);
        setLoading(false);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format returned from supabase:', data);
        setError('Format de données invalide');
        setTemplates([]);
        setLoading(false);
        return [];
      }

      // Validate each template
      const validTemplates = data
        .filter(template => 
          template && 
          typeof template === 'object' && 
          typeof template.id === 'string' && 
          typeof template.scenario_description === 'string' &&
          typeof template.domain === 'string'
        ) as RiskScenarioTemplate[];

      console.log(`Templates loaded successfully: ${validTemplates.length}`);
      setTemplates(validTemplates);
      setLoading(false);
      return validTemplates;
    } catch (error) {
      console.error('Exception when fetching risk scenario templates:', error);
      setError(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      setTemplates([]);
      setLoading(false);
      return [];
    }
  };

  const getRiskScenarioTemplatesByDomain = async (domain: string): Promise<RiskScenarioTemplate[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('risk_scenarios_templates')
        .select('*')
        .ilike('domain', `%${domain}%`)
        .order('domain', { ascending: true });

      if (error) {
        console.error('Error fetching risk scenario templates by domain:', error);
        setError(`Erreur: ${error.message}`);
        setLoading(false);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        setError('Format de données invalide');
        setLoading(false);
        return [];
      }

      const validTemplates = data
        .filter(template => 
          template && 
          typeof template === 'object' && 
          typeof template.id === 'string' && 
          typeof template.scenario_description === 'string' &&
          typeof template.domain === 'string'
        ) as RiskScenarioTemplate[];
      
      setLoading(false);
      return validTemplates;
    } catch (error) {
      console.error('Exception when fetching risk scenario templates by domain:', error);
      setError(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
      return [];
    }
  };

  return {
    templates,
    loading,
    error,
    fetchRiskScenarioTemplates,
    getRiskScenarioTemplatesByDomain
  };
};
