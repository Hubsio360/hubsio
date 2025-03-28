
import { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from './use-toast';
import { CompanyRiskScale, RiskScaleLevel, RiskScaleType, RiskScaleWithLevels } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useRiskScalesManager = (companyId: string) => {
  const { 
    riskScaleTypes,
    companyRiskScales,
    fetchRiskScaleTypes, 
    fetchCompanyRiskScales,
    addRiskScaleType,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    updateRiskScaleType,
    toggleRiskScaleActive,
    loading 
  } = useData();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedScales, setCachedScales] = useState<RiskScaleWithLevels[]>([]);
  const [cachedTypes, setCachedTypes] = useState<RiskScaleType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to ensure a CompanyRiskScale has the required fields to be a RiskScaleWithLevels
  const ensureWithLevels = (scale: CompanyRiskScale): RiskScaleWithLevels => {
    const scaleTypeId = scale.scaleTypeId || scale.scale_type_id || '';
    const scaleType = riskScaleTypes.find(type => type.id === scaleTypeId) || {
      id: '',
      name: 'Type inconnu',
      description: ''
    };
    
    return {
      ...scale,
      levels: scale.levels || [],
      scaleType
    };
  };

  // Initial data loading
  const loadData = useCallback(async () => {
    if (!companyId) return;
    
    setIsInitialLoading(true);
    setError(null);
    
    try {
      // Use Promise.all to fetch both data sets concurrently
      await Promise.all([
        fetchRiskScaleTypes(),
        fetchCompanyRiskScales(companyId)
      ]);
    } catch (err) {
      console.error('Error loading risk scales data:', err);
      setError('Erreur lors du chargement des échelles de risque');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors du chargement des échelles de risque',
      });
    } finally {
      setIsInitialLoading(false);
    }
  }, [companyId, fetchRiskScaleTypes, fetchCompanyRiskScales, toast]);

  // Refresh data with loading indicator for subsequent refreshes
  const refreshData = useCallback(async () => {
    if (!companyId) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchRiskScaleTypes(),
        fetchCompanyRiskScales(companyId)
      ]);
    } catch (err) {
      console.error('Error refreshing risk scales data:', err);
      setError('Erreur lors de l\'actualisation des échelles de risque');
    } finally {
      setIsRefreshing(false);
    }
  }, [companyId, fetchRiskScaleTypes, fetchCompanyRiskScales]);

  // Helper function to get companyId regardless of naming convention
  const getCompanyId = (scale: CompanyRiskScale): string => {
    return scale.companyId || scale.company_id || '';
  };

  // Helper function to get scaleTypeId regardless of naming convention
  const getScaleTypeId = (scale: CompanyRiskScale): string => {
    return scale.scaleTypeId || scale.scale_type_id || '';
  };

  // Handle updating a risk scale type
  const handleUpdateScaleType = useCallback(async (scaleTypeId: string, name: string, description: string) => {
    if (!companyId) return null;
    
    try {
      const updatedType = await updateRiskScaleType(scaleTypeId, { name, description });
      
      if (updatedType) {
        await refreshData();
        
        toast({
          title: 'Succès',
          description: 'Échelle de risque mise à jour avec succès',
        });
        
        return updatedType;
      }
      return null;
    } catch (err) {
      console.error('Error updating risk scale type:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour de l\'échelle de risque',
      });
      return null;
    }
  }, [companyId, updateRiskScaleType, refreshData, toast]);

  // Handle adding a custom scale
  const handleAddCustomScale = useCallback(async () => {
    if (!companyId) return;
    
    try {
      // First, create a new custom scale type
      const customScaleName = `custom-scale-${uuidv4().slice(0, 8)}`;
      const customScaleDescription = `Échelle personnalisée`;
      
      const newScaleType = await addRiskScaleType(customScaleName, customScaleDescription);
      
      if (!newScaleType) {
        throw new Error('Erreur lors de la création du type d\'échelle');
      }
      
      // Then create the company risk scale with default levels
      await addCompanyRiskScale(companyId, newScaleType.id, []);
      
      await refreshData();
      
      toast({
        title: 'Succès',
        description: 'Nouvelle échelle de risque créée avec succès',
      });

      return newScaleType;
    } catch (err) {
      console.error('Error adding custom risk scale:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de la création de l\'échelle de risque personnalisée',
      });
      return null;
    }
  }, [companyId, addRiskScaleType, addCompanyRiskScale, refreshData, toast]);

  // Handle scale creation with error handling for duplicate entries
  const handleAddScale = useCallback(async (scaleTypeId: string) => {
    if (!companyId) return;
    
    try {
      // Check if this combination already exists to prevent duplicate key error
      const existingScale = companyRiskScales.find(
        (scale) => getCompanyId(scale) === companyId && getScaleTypeId(scale) === scaleTypeId
      );
      
      if (existingScale) {
        toast({
          variant: 'default',
          title: 'Information',
          description: 'Cette échelle de risque existe déjà pour cette entreprise',
        });
        return;
      }
      
      // Pass empty array as the third parameter
      await addCompanyRiskScale(companyId, scaleTypeId, []);
      
      await refreshData();
      
      toast({
        title: 'Succès',
        description: 'Échelle de risque ajoutée avec succès',
      });
    } catch (err) {
      console.error('Error adding risk scale:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout de l\'échelle de risque',
      });
    }
  }, [companyId, companyRiskScales, addCompanyRiskScale, refreshData, toast]);

  // Toggle scale with optimistic UI update
  const handleToggleActive = useCallback(async (scaleId: string, isActive: boolean) => {
    try {
      // Optimistic update for UI responsiveness
      const updatedScales = companyRiskScales.map(scale => 
        scale.id === scaleId ? { 
          ...scale, 
          isActive: !isActive,
          is_active: !isActive  // Update both property formats
        } : scale
      ).map(ensureWithLevels);
      
      setCachedScales(updatedScales);
      
      await toggleRiskScaleActive(scaleId, !isActive);
      await refreshData();
    } catch (err) {
      console.error('Error toggling risk scale:', err);
      setCachedScales(companyRiskScales.map(ensureWithLevels)); // Revert on error
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de la modification de l\'échelle de risque',
      });
    }
  }, [companyRiskScales, toggleRiskScaleActive, refreshData, toast]);

  // Update risk scale level with error handling
  const handleUpdateLevel = useCallback(async (levelId: string, updatedData: Partial<RiskScaleLevel>) => {
    try {
      await updateRiskScaleLevel(levelId, updatedData);
      // No need to refresh entire data set for level updates
    } catch (err) {
      console.error('Error updating risk scale level:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du niveau de risque',
      });
    }
  }, [updateRiskScaleLevel, toast]);

  // Initial data load on component mount
  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId, loadData]);

  // Update cache when data changes
  useEffect(() => {
    if (!loading.riskScaleTypes && !loading.companyRiskScales) {
      setCachedScales(companyRiskScales.map(ensureWithLevels));
      setCachedTypes(riskScaleTypes);
    }
  }, [companyRiskScales, riskScaleTypes, loading.companyRiskScales, loading.riskScaleTypes]);

  return {
    riskScaleTypes: cachedTypes,
    companyRiskScales: cachedScales,
    isLoading: isInitialLoading || loading.companyRiskScales || loading.riskScaleTypes,
    isRefreshing,
    error,
    addScale: handleAddScale,
    addCustomScale: handleAddCustomScale,
    updateScaleType: handleUpdateScaleType,
    toggleActive: handleToggleActive,
    updateLevel: handleUpdateLevel,
    refreshData
  };
};
