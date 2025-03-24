
import { useState, useCallback } from 'react';
import { AuditTheme } from '@/types';
import { mockThemes } from '../mocks/mockData';

export const useThemes = () => {
  const [themes] = useState<AuditTheme[]>(mockThemes);

  const fetchThemes = useCallback(async (): Promise<AuditTheme[]> => {
    return themes;
  }, [themes]);

  const addTheme = useCallback(async (theme: Omit<AuditTheme, 'id'>): Promise<AuditTheme | null> => {
    console.log('Ajout d\'une thématique:', theme);
    return { id: `theme-${Date.now()}`, ...theme };
  }, []);

  const updateTheme = useCallback(async (id: string, updates: Partial<AuditTheme>): Promise<AuditTheme | null> => {
    console.log('Mise à jour de la thématique:', id, updates);
    return { id, name: updates.name || 'Theme name', description: updates.description };
  }, []);

  const deleteTheme = useCallback(async (id: string): Promise<boolean> => {
    console.log('Suppression de la thématique:', id);
    return true;
  }, []);

  return {
    themes,
    fetchThemes,
    addTheme,
    updateTheme,
    deleteTheme
  };
};
