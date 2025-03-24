
import { useState, useEffect } from 'react';
import { FrameworkControl } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useControls = () => {
  const [controls, setControls] = useState<FrameworkControl[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchControls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('framework_controls')
        .select('*');
      
      if (error) {
        console.error('Error fetching controls:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les contrôles: " + error.message,
          variant: "destructive",
        });
        return;
      }

      const formattedControls: FrameworkControl[] = data.map(item => ({
        id: item.id,
        frameworkId: item.framework_id,
        referenceCode: item.reference_code,
        title: item.title,
        description: item.description || ''
      }));
      
      setControls(formattedControls);
    } catch (error) {
      console.error('Error in fetchControls:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des contrôles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, [toast]);

  const updateControl = async (
    id: string,
    updates: Partial<FrameworkControl>
  ): Promise<FrameworkControl> => {
    try {
      const dbUpdates = {
        ...(updates.referenceCode && { reference_code: updates.referenceCode }),
        ...(updates.title && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description })
      };

      const { data, error } = await supabase
        .from('framework_controls')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating control:', error);
        throw new Error(`Erreur lors de la mise à jour du contrôle: ${error.message}`);
      }

      const updatedControl: FrameworkControl = {
        id: data.id,
        frameworkId: data.framework_id,
        referenceCode: data.reference_code,
        title: data.title,
        description: data.description || '',
      };

      setControls(prev => prev.map(c => 
        c.id === id ? updatedControl : c
      ));

      return updatedControl;
    } catch (error) {
      console.error('Error in updateControl:', error);
      throw error;
    }
  };

  const addControl = async (
    control: Omit<FrameworkControl, 'id'>
  ): Promise<FrameworkControl> => {
    try {
      const dbControl = {
        framework_id: control.frameworkId,
        reference_code: control.referenceCode,
        title: control.title,
        description: control.description || null
      };

      const { data, error } = await supabase
        .from('framework_controls')
        .insert(dbControl)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding control:', error);
        throw new Error(`Erreur lors de l'ajout du contrôle: ${error.message}`);
      }

      const newControl: FrameworkControl = {
        id: data.id,
        frameworkId: data.framework_id,
        referenceCode: data.reference_code,
        title: data.title,
        description: data.description || '',
      };

      setControls(prev => [...prev, newControl]);

      return newControl;
    } catch (error) {
      console.error('Error in addControl:', error);
      throw error;
    }
  };

  const getControlById = (id: string): FrameworkControl | undefined => {
    return controls.find((control) => control.id === id);
  };

  return {
    controls,
    loading,
    updateControl,
    addControl,
    getControlById,
    fetchControls
  };
};
