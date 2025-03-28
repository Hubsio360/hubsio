import { useState, useEffect } from 'react';
import { Framework, FrameworkImport, FrameworkImportResult } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFrameworks = () => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFrameworks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('frameworks')
        .select('*');
      
      if (error) {
        console.error('Error fetching frameworks:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les référentiels: " + error.message,
          variant: "destructive",
        });
        return;
      }

      const formattedFrameworks: Framework[] = data.map(item => ({
        id: item.id,
        name: item.name,
        version: item.version
      }));
      
      setFrameworks(formattedFrameworks);
    } catch (error) {
      console.error('Error in fetchFrameworks:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des référentiels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrameworks();
  }, [toast]);

  const refreshFrameworks = async () => {
    return await fetchFrameworks();
  };

  const importFramework = async (inputFramework: FrameworkImport): Promise<FrameworkImportResult> => {
    try {
      console.log("Début de l'importation du framework:", inputFramework.name);
      
      // Vérification de la session utilisateur
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("Aucune session utilisateur active");
        throw new Error("Vous devez être connecté pour importer un référentiel");
      }
      
      console.log("Session utilisateur vérifiée, utilisateur connecté");
      
      // Insertion du framework dans la base de données
      const { data: newFrameworkData, error: frameworkError } = await supabase
        .from('frameworks')
        .insert({
          name: inputFramework.name,
          version: inputFramework.version
        })
        .select()
        .single();
      
      if (frameworkError) {
        console.error('Error inserting framework:', frameworkError);
        throw new Error(`Erreur lors de l'insertion du référentiel: ${frameworkError.message}`);
      }
      
      console.log("Framework inséré avec succès:", newFrameworkData);

      const newFramework: Framework = {
        id: newFrameworkData.id,
        name: newFrameworkData.name,
        version: newFrameworkData.version,
      };
      
      const controlsToInsert = inputFramework.controls.map(control => ({
        framework_id: newFramework.id,
        reference_code: control.referenceCode,
        title: control.title,
        description: control.description,
      }));
      
      console.log("Préparation à l'insertion de", controlsToInsert.length, "contrôles");
      
      const { data: controlsData, error: controlsError } = await supabase
        .from('framework_controls')
        .insert(controlsToInsert)
        .select();
      
      if (controlsError) {
        console.error('Error inserting controls:', controlsError);
        // Tentative de suppression du framework en cas d'échec des contrôles
        await supabase.from('frameworks').delete().eq('id', newFramework.id);
        throw new Error(`Erreur lors de l'insertion des contrôles: ${controlsError.message}`);
      }
      
      console.log("Contrôles insérés avec succès:", controlsData?.length || 0, "contrôles");
      
      // Mise à jour du state
      setFrameworks(prev => [...prev, newFramework]);
      
      console.log("Importation terminée avec succès");
      
      return {
        framework: newFramework,
        controlsCount: controlsData?.length || 0,
      };
    } catch (error: any) {
      console.error('Error in importFramework:', error);
      throw error;
    }
  };

  const updateFramework = async (
    id: string,
    updates: Partial<Framework>
  ): Promise<Framework> => {
    try {
      const dbUpdates = {
        ...(updates.name && { name: updates.name }),
        ...(updates.version && { version: updates.version })
      };

      const { data, error } = await supabase
        .from('frameworks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating framework:', error);
        throw new Error(`Erreur lors de la mise à jour du référentiel: ${error.message}`);
      }

      const updatedFramework: Framework = {
        id: data.id,
        name: data.name,
        version: data.version,
      };

      setFrameworks(prev => prev.map(f => 
        f.id === id ? updatedFramework : f
      ));

      return updatedFramework;
    } catch (error) {
      console.error('Error in updateFramework:', error);
      throw error;
    }
  };

  const deleteFramework = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('frameworks')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting framework:', error);
        throw new Error(`Erreur lors de la suppression du référentiel: ${error.message}`);
      }

      setFrameworks(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error in deleteFramework:', error);
      throw error;
    }
  };

  const getFrameworkById = (id: string): Framework | undefined => {
    return frameworks.find((framework) => framework.id === id);
  };

  return {
    frameworks,
    loading,
    importFramework,
    updateFramework,
    deleteFramework,
    getFrameworkById,
    fetchFrameworks,
    refreshFrameworks
  };
};
