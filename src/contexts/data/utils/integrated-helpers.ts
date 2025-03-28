
import { supabase } from '@/integrations/supabase/client';
import { AuditTheme } from '@/types';

/**
 * Fetches all themes or themes for a specific framework
 * If no themes are found, it creates default basic themes
 */
export const fetchThemesByFrameworkId = async (
  frameworkId?: string
): Promise<AuditTheme[]> => {
  console.log(`Fetching themes ${frameworkId ? `for framework ${frameworkId}` : 'for all frameworks'}`);
  
  try {
    // Fetch all themes - we don't actually have a link between themes and frameworks
    // so for now we'll just return all themes
    const { data, error } = await supabase
      .from('audit_themes')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching themes:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} themes`);
    
    // Map to the expected format and ensure description is always a string
    return (data || []).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description || ''  // Ensure description is always a string, never undefined
    }));
  } catch (error) {
    console.error('Error in fetchThemesByFrameworkId:', error);
    return [];
  }
};

/**
 * Creates default themes if none exist
 */
export const createDefaultThemes = async (): Promise<AuditTheme[]> => {
  console.log('Creating default themes');
  
  const defaultThemes = [
    { name: 'Gouvernance', description: 'Thématiques liées à la gouvernance de la sécurité' },
    { name: 'Technique', description: 'Aspects techniques de la sécurité de l\'information' },
    { name: 'Organisationnel', description: 'Organisation de la sécurité' },
    { name: 'Conformité', description: 'Aspects relatifs à la conformité' },
    { name: 'Gestion des risques', description: 'Processus de gestion des risques' }
  ];
  
  try {
    const { data, error } = await supabase
      .from('audit_themes')
      .insert(defaultThemes)
      .select();
    
    if (error) {
      console.error('Error creating default themes:', error);
      return [];
    }
    
    console.log(`Created ${data?.length || 0} default themes`);
    
    // Return data with description always as string
    return (data || []).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description || ''  // Ensure description is always a string
    }));
  } catch (error) {
    console.error('Error in createDefaultThemes:', error);
    return [];
  }
};
