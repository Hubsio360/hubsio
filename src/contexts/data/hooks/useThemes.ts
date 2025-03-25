
import { useState } from 'react';
import { AuditTheme } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useThemes = () => {
  const [themes, setThemes] = useState<AuditTheme[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchThemes = async (): Promise<AuditTheme[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_themes')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching audit themes:', error);
        return [];
      }
      
      const fetchedThemes = (data || []).map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description || ''
      }));
      
      setThemes(fetchedThemes);
      return fetchedThemes;
    } catch (error) {
      console.error('Error fetching audit themes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTheme = async (theme: Omit<AuditTheme, 'id'>): Promise<AuditTheme | null> => {
    try {
      const { data, error } = await supabase
        .from('audit_themes')
        .insert([theme])
        .select();
      
      if (error) {
        console.error('Error adding audit theme:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from insert operation');
        return null;
      }
      
      const newTheme: AuditTheme = {
        id: data[0].id,
        name: data[0].name,
        description: data[0].description || ''
      };
      
      setThemes(prev => [...prev, newTheme]);
      return newTheme;
    } catch (error) {
      console.error('Error adding audit theme:', error);
      return null;
    }
  };

  const updateTheme = async (id: string, updates: Partial<AuditTheme>): Promise<AuditTheme | null> => {
    try {
      const { data, error } = await supabase
        .from('audit_themes')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating audit theme:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from update operation');
        return null;
      }
      
      const updatedTheme: AuditTheme = {
        id: data[0].id,
        name: data[0].name,
        description: data[0].description || ''
      };
      
      setThemes(prev =>
        prev.map(theme => (theme.id === id ? updatedTheme : theme))
      );
      
      return updatedTheme;
    } catch (error) {
      console.error('Error updating audit theme:', error);
      return null;
    }
  };

  const deleteTheme = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_themes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting audit theme:', error);
        return false;
      }
      
      setThemes(prev => prev.filter(theme => theme.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting audit theme:', error);
      return false;
    }
  };

  return {
    themes,
    loading,
    fetchThemes,
    addTheme,
    updateTheme,
    deleteTheme
  };
};
