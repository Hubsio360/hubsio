
import { useState } from 'react';
import { AuditTheme } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createDefaultThemes } from '../utils/integrated-helpers';

export const useThemes = () => {
  const [themes, setThemes] = useState<AuditTheme[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchThemes = async (): Promise<AuditTheme[]> => {
    setLoading(true);
    try {
      console.log("Fetching all audit themes...");
      const { data, error } = await supabase
        .from('audit_themes')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching audit themes:', error);
        
        // Try to create default themes
        console.log("No themes found, attempting to create default themes");
        const defaultThemes = await createDefaultThemes();
        setThemes(defaultThemes);
        return defaultThemes;
      }
      
      if (!data || data.length === 0) {
        console.log("No audit themes found in database, creating default themes");
        const defaultThemes = await createDefaultThemes();
        setThemes(defaultThemes);
        return defaultThemes;
      } else {
        console.log(`Found ${data.length} audit themes`);
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
      
      // En cas d'erreur catastrophique, renvoyons un tableau vide mais affichons un toast
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les thématiques d'audit",
      });
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTheme = async (theme: Omit<AuditTheme, 'id'>): Promise<AuditTheme | null> => {
    try {
      console.log("Adding new audit theme:", theme);
      
      // Verify the theme has a name
      if (!theme.name || theme.name.trim() === '') {
        console.error('Theme name is required');
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Le nom de la thématique est requis",
        });
        return null;
      }
      
      // Create a properly formatted object for Supabase
      const themeData = {
        name: theme.name,
        description: theme.description || ''
      };
      
      const { data, error } = await supabase
        .from('audit_themes')
        .insert(themeData)
        .select();
      
      if (error) {
        console.error('Error adding audit theme:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter la thématique",
        });
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from insert operation');
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Aucune donnée retournée lors de l'ajout de la thématique",
        });
        return null;
      }
      
      console.log("Theme added successfully:", data[0]);
      
      const newTheme: AuditTheme = {
        id: data[0].id,
        name: data[0].name,
        description: data[0].description || ''
      };
      
      setThemes(prev => [...prev, newTheme]);
      
      toast({
        title: "Thématique ajoutée",
        description: `La thématique "${newTheme.name}" a été ajoutée avec succès`,
      });
      
      return newTheme;
    } catch (error) {
      console.error('Error adding audit theme:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la thématique",
      });
      return null;
    }
  };

  const updateTheme = async (id: string, updates: Partial<AuditTheme>): Promise<AuditTheme | null> => {
    try {
      console.log(`Updating theme with id ${id}:`, updates);
      
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
      
      console.log("Theme updated successfully:", data[0]);
      
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
      console.log(`Deleting theme with id ${id}`);
      
      const { error } = await supabase
        .from('audit_themes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting audit theme:', error);
        return false;
      }
      
      console.log("Theme deleted successfully");
      
      setThemes(prev => prev.filter(theme => theme.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting audit theme:', error);
      return false;
    }
  };
  
  const checkOrCreateThemes = async (): Promise<boolean> => {
    try {
      console.log("Checking if themes exist, creating if needed");
      
      const { data, error } = await supabase
        .from('audit_themes')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error("Error checking for themes:", error);
        return false;
      }
      
      if (data && data.length > 0) {
        console.log("Themes already exist");
        return true;
      }
      
      // No themes exist, create defaults
      console.log("No themes found, creating defaults");
      const defaultThemes = await createDefaultThemes();
      setThemes(defaultThemes);
      return defaultThemes.length > 0;
      
    } catch (error) {
      console.error("Error in checkOrCreateThemes:", error);
      return false;
    }
  };

  return {
    themes,
    loading,
    fetchThemes,
    addTheme,
    updateTheme,
    deleteTheme,
    checkOrCreateThemes
  };
};
