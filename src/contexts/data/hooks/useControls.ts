
import { useState, useCallback } from 'react';
import { FrameworkControl, Framework } from '@/types';

export const useControls = () => {
  const [controls, setControls] = useState<FrameworkControl[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchControlsByFrameworkId = useCallback(async (frameworkId: string): Promise<FrameworkControl[]> => {
    setLoading(true);
    try {
      // In a real implementation, this would be a database call
      const frameworkControls = controls.filter(control => control.frameworkId === frameworkId);
      return frameworkControls;
    } catch (error) {
      console.error('Error fetching controls:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [controls]);

  const getControlById = useCallback((id: string): FrameworkControl | undefined => {
    return controls.find(control => control.id === id);
  }, [controls]);

  const updateControl = useCallback(async (id: string, updates: Partial<FrameworkControl>): Promise<FrameworkControl> => {
    const control = getControlById(id);
    if (!control) {
      throw new Error(`Control with id ${id} not found`);
    }
    
    const updatedControl = { ...control, ...updates };
    setControls(prev => prev.map(c => c.id === id ? updatedControl : c));
    return updatedControl;
  }, [getControlById]);

  const addControl = useCallback(async (newControl: Omit<FrameworkControl, 'id'>): Promise<FrameworkControl> => {
    const control = { ...newControl, id: `control-${Date.now()}` };
    setControls(prev => [...prev, control]);
    return control;
  }, []);

  return {
    controls,
    loading,
    fetchControlsByFrameworkId,
    getControlById,
    updateControl,
    addControl
  };
};
