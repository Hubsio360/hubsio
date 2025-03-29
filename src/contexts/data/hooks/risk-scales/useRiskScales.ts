
import { useState, useCallback } from 'react';
import { RiskScaleType, CompanyRiskScale, RiskScaleLevel, RiskScaleWithLevels } from '@/types';
import { useRiskScaleTypes } from './riskScaleTypes';
import { useCompanyRiskScales } from './companyRiskScales';
import { useDefaultScalesManager } from './defaultScalesManager';

export const useRiskScales = () => {
  const [riskScaleTypes, setRiskScaleTypes] = useState<RiskScaleType[]>([]);
  const [companyRiskScales, setCompanyRiskScales] = useState<RiskScaleWithLevels[]>([]);
  const [loading, setLoading] = useState({
    riskScaleTypes: false,
    companyRiskScales: false
  });

  const { 
    fetchRiskScaleTypes: fetchTypes, 
    addRiskScaleType: addType, 
    updateRiskScaleType: updateType 
  } = useRiskScaleTypes();
  
  const { 
    fetchCompanyRiskScales: fetchScales, 
    addCompanyRiskScale: addScale,
    updateRiskScaleLevel: updateLevel,
    toggleRiskScaleActive: toggleActive,
    deleteRiskScale: deleteScale
  } = useCompanyRiskScales();
  
  const { 
    ensureDefaultScalesExist: ensureDefaults, 
    setupLikelihoodScale: setupLikelihood 
  } = useDefaultScalesManager();

  // Fetch risk scale types
  const fetchRiskScaleTypes = useCallback(async (): Promise<RiskScaleType[]> => {
    setLoading(prev => ({ ...prev, riskScaleTypes: true }));
    try {
      const fetchedTypes = await fetchTypes();
      setRiskScaleTypes(fetchedTypes);
      return fetchedTypes;
    } catch (error) {
      console.error('Error in fetchRiskScaleTypes:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskScaleTypes: false }));
    }
  }, [fetchTypes]);

  // Fetch company risk scales with their associated levels
  const fetchCompanyRiskScales = useCallback(async (companyId: string): Promise<RiskScaleWithLevels[]> => {
    setLoading(prev => ({ ...prev, companyRiskScales: true }));
    try {
      // Fetch risk scale types if not yet loaded
      if (riskScaleTypes.length === 0) {
        await fetchRiskScaleTypes();
      }
      
      const scalesWithLevels = await fetchScales(companyId, riskScaleTypes);
      setCompanyRiskScales(scalesWithLevels);
      return scalesWithLevels;
    } catch (error) {
      console.error('Error in fetchCompanyRiskScales:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, companyRiskScales: false }));
    }
  }, [fetchScales, riskScaleTypes, fetchRiskScaleTypes]);

  // Add a new risk scale type
  const addRiskScaleType = useCallback(async (
    name: string,
    description: string
  ): Promise<RiskScaleType | null> => {
    try {
      const newType = await addType(name, description);
      
      if (newType) {
        setRiskScaleTypes(prev => [...prev, newType]);
      }
      
      return newType;
    } catch (error) {
      console.error('Error in addRiskScaleType:', error);
      return null;
    }
  }, [addType]);

  // Update a risk scale type
  const updateRiskScaleType = useCallback(async (
    scaleTypeId: string,
    name: string,
    description: string
  ): Promise<RiskScaleType | null> => {
    try {
      const updatedType = await updateType(scaleTypeId, name, description);
      
      if (updatedType) {
        setRiskScaleTypes(prev => 
          prev.map(type => type.id === scaleTypeId ? updatedType : type)
        );
      }
      
      return updatedType;
    } catch (error) {
      console.error('Error in updateRiskScaleType:', error);
      return null;
    }
  }, [updateType]);

  // Add a company risk scale
  const addCompanyRiskScale = useCallback(async (
    companyId: string,
    scaleTypeId: string,
    levels: Omit<RiskScaleLevel, 'id' | 'companyRiskScaleId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<RiskScaleWithLevels | null> => {
    try {
      const newScaleWithLevels = await addScale(companyId, scaleTypeId, levels, riskScaleTypes);
      
      if (newScaleWithLevels) {
        setCompanyRiskScales(prev => [...prev, newScaleWithLevels]);
      }
      
      return newScaleWithLevels;
    } catch (error) {
      console.error('Error in addCompanyRiskScale:', error);
      return null;
    }
  }, [addScale, riskScaleTypes]);

  // Update a risk scale level
  const updateRiskScaleLevel = useCallback(async (
    levelId: string,
    updatedData: Partial<RiskScaleLevel>
  ): Promise<RiskScaleLevel | null> => {
    try {
      const updatedLevel = await updateLevel(levelId, updatedData);
      
      if (updatedLevel) {
        // Update the level in the companyRiskScales state
        setCompanyRiskScales(prev => 
          prev.map(scale => ({
            ...scale,
            levels: scale.levels.map(level => 
              level.id === levelId ? updatedLevel : level
            )
          }))
        );
      }
      
      return updatedLevel;
    } catch (error) {
      console.error('Error in updateRiskScaleLevel:', error);
      return null;
    }
  }, [updateLevel]);

  // Toggle active state of a risk scale
  const toggleRiskScaleActive = useCallback(async (
    scaleId: string,
    isActive: boolean
  ): Promise<boolean> => {
    try {
      const success = await toggleActive(scaleId, isActive);
      
      if (success) {
        setCompanyRiskScales(prev => 
          prev.map(scale => 
            scale.id === scaleId ? { 
              ...scale, 
              isActive: !isActive,
              is_active: !isActive 
            } : scale
          )
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error in toggleRiskScaleActive:', error);
      return false;
    }
  }, [toggleActive]);

  // Ensure default risk scales exist for a company
  const ensureDefaultScalesExist = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      return await ensureDefaults(companyId);
    } catch (error) {
      console.error('Error in ensureDefaultScalesExist:', error);
      return false;
    }
  }, [ensureDefaults]);

  // Delete a risk scale
  const deleteRiskScale = useCallback(async (scaleId: string): Promise<boolean> => {
    try {
      const success = await deleteScale(scaleId);
      
      if (success) {
        setCompanyRiskScales(prev => prev.filter(scale => scale.id !== scaleId));
      }
      
      return success;
    } catch (error) {
      console.error('Error in deleteRiskScale:', error);
      return false;
    }
  }, [deleteScale]);

  // Setup likelihood scale
  const setupLikelihoodScale = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      return await setupLikelihood(companyId);
    } catch (error) {
      console.error('Error in setupLikelihoodScale:', error);
      return false;
    }
  }, [setupLikelihood]);

  return {
    riskScaleTypes,
    companyRiskScales,
    loading,
    fetchRiskScaleTypes,
    fetchCompanyRiskScales,
    ensureDefaultScalesExist,
    addRiskScaleType,
    updateRiskScaleType,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    toggleRiskScaleActive,
    deleteRiskScale,
    setupLikelihoodScale
  };
};
