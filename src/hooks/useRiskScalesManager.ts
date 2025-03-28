
import { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from './use-toast';
import { CompanyRiskScale, RiskScaleLevel, RiskScaleType } from '@/types';

export const useRiskScalesManager = (companyId: string) => {
  const { 
    riskScaleTypes,
    companyRiskScales,
    fetchRiskScaleTypes, 
    fetchCompanyRiskScales,
    addRiskScaleType,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    toggleRiskScaleActive,
    loading 
  } = useData();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedScales, setCachedScales] = useState<CompanyRiskScale[]>([]);
  const [cachedTypes, setCachedTypes] = useState<RiskScaleType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      // Use an empty array for levels since they will be created by the backend
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
      );
      setCachedScales(updatedScales);
      
      await toggleRiskScaleActive(scaleId, !isActive);
      await refreshData();
    } catch (err) {
      console.error('Error toggling risk scale:', err);
      setCachedScales(companyRiskScales); // Revert on error
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
    if (!loading.companyRiskScales && !loading.riskScaleTypes) {
      setCachedScales(companyRiskScales);
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
    toggleActive: handleToggleActive,
    updateLevel: handleUpdateLevel,
    refreshData
  };
};
