import { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from './use-toast';
import { CompanyRiskScale, RiskScaleLevel, RiskScaleType, RiskScaleWithLevels } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const scaleNameMapping: Record<string, string> = {
  'financial_impact': 'Impact financier',
  'reputational_impact': 'Impact réputationnel',
  'individual_impact': 'Impact individuel',
  'regulatory_impact': 'Impact réglementaire',
  'productivity_impact': 'Impact sur la productivité',
  'likelihood': 'Probabilité'
};

export const useRiskScalesManager = (companyId: string) => {
  const { 
    riskScaleTypes,
    companyRiskScales,
    fetchRiskScaleTypes, 
    fetchCompanyRiskScales,
    ensureDefaultScalesExist: ensureDefaultScalesExistApi,
    addRiskScaleType,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    updateRiskScaleType,
    toggleRiskScaleActive,
    deleteRiskScale,
    setupLikelihoodScale,
    loading 
  } = useData();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedScales, setCachedScales] = useState<RiskScaleWithLevels[]>([]);
  const [cachedTypes, setCachedTypes] = useState<RiskScaleType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const ensureWithLevels = (scale: CompanyRiskScale): RiskScaleWithLevels => {
    const scaleTypeId = scale.scale_type_id || '';
    const scaleType = riskScaleTypes?.find(type => type.id === scaleTypeId) || {
      id: '',
      name: 'Type inconnu',
      description: '',
      category: 'impact'
    };
    
    if (scaleType.name && scaleNameMapping[scaleType.name]) {
      scaleType.name = scaleNameMapping[scaleType.name];
    }
    
    return {
      ...scale,
      levels: scale.levels || [],
      scaleType
    };
  };

  const ensureDefaultScalesExist = useCallback(async (): Promise<boolean> => {
    if (!companyId) return false;
    
    try {
      console.log("Vérification des échelles de risque pour le client:", companyId);
      
      const result = await ensureDefaultScalesExistApi(companyId);
      
      if (result) {
        console.log("Échelles de risque par défaut créées avec succès");
        await Promise.all([
          fetchRiskScaleTypes(),
          fetchCompanyRiskScales(companyId)
        ]);
        
        const hasLikelihoodScale = companyRiskScales?.some(
          scale => scale.scaleType?.category === 'likelihood'
        );
        
        if (!hasLikelihoodScale) {
          console.log("Création de l'échelle de probabilité manquante");
          await setupLikelihoodScale(companyId);
        }
      }
      
      return result;
    } catch (err) {
      console.error('Error ensuring default scales exist:', err);
      setError('Erreur lors de la création des échelles de risque par défaut');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de la création des échelles de risque par défaut',
      });
      return false;
    }
  }, [companyId, ensureDefaultScalesExistApi, fetchRiskScaleTypes, fetchCompanyRiskScales, toast, companyRiskScales, setupLikelihoodScale]);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    
    setIsInitialLoading(true);
    setError(null);
    
    try {
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

  const getScaleTypeId = (scale: CompanyRiskScale): string => {
    return scale.scale_type_id;
  };

  const getCompanyId = (scale: CompanyRiskScale): string => {
    return scale.company_id;
  };

  const handleUpdateScaleType = useCallback(async (
    scaleTypeId: string, 
    name: string, 
    description: string
  ) => {
    if (!companyId) return null;
    
    try {
      const updatedType = await updateRiskScaleType(scaleTypeId, name, description);
      
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

  const handleAddCustomScale = useCallback(async (category: 'impact' | 'likelihood' = 'impact') => {
    if (!companyId) return null;
    
    try {
      const customScaleName = `Échelle personnalisée`;
      const customScaleDescription = `Échelle personnalisée`;
      
      const newScaleType = await addRiskScaleType(customScaleName, customScaleDescription);
      
      if (!newScaleType) {
        throw new Error('Erreur lors de la création du type d\'échelle');
      }
      
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

  const handleDeleteScale = useCallback(async (scaleId: string): Promise<boolean> => {
    try {
      console.log("Début de la suppression de l'échelle:", scaleId);
      
      setCachedScales(prev => prev.filter(scale => scale.id !== scaleId));
      
      const result = await deleteRiskScale(scaleId);
      console.log("Résultat de la suppression de l'API:", result);
      
      if (result) {
        toast({
          title: "Suppression réussie",
          description: "L'échelle de risque a été supprimée avec succès",
        });
        
        await refreshData();
        return true;
      } else {
        console.error("La suppression a échoué côté serveur");
        toast({
          variant: "destructive",
          title: "Échec de la suppression",
          description: "La suppression de l'échelle a échoué. Veuillez réessayer.",
        });
        
        await refreshData();
        return false;
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'échelle de risque:', err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'échelle",
      });
      
      await refreshData();
      return false;
    }
  }, [deleteRiskScale, refreshData, toast]);

  const handleAddScale = useCallback(async (scaleTypeId: string) => {
    if (!companyId) return;
    
    try {
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

  const handleToggleActive = useCallback(async (scaleId: string, isActive: boolean) => {
    try {
      const updatedScales = companyRiskScales.map(scale => 
        scale.id === scaleId ? { 
          ...scale, 
          isActive: !isActive,
          is_active: !isActive 
        } : scale
      ).map(ensureWithLevels);
      
      setCachedScales(updatedScales);
      
      await toggleRiskScaleActive(scaleId, !isActive);
      await refreshData();
    } catch (err) {
      console.error('Error toggling risk scale:', err);
      setCachedScales(companyRiskScales.map(ensureWithLevels));
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de la modification de l\'échelle de risque',
      });
    }
  }, [companyRiskScales, toggleRiskScaleActive, refreshData, toast]);

  const handleUpdateLevel = useCallback(async (levelId: string, updatedData: Partial<RiskScaleLevel>) => {
    try {
      await updateRiskScaleLevel(levelId, updatedData);
    } catch (err) {
      console.error('Error updating risk scale level:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du niveau de risque',
      });
    }
  }, [updateRiskScaleLevel, toast]);

  useEffect(() => {
    if (companyId) {
      const initializeData = async () => {
        setIsInitialLoading(true);
        try {
          await Promise.all([
            fetchRiskScaleTypes(),
            fetchCompanyRiskScales(companyId)
          ]);
          
          if (!companyRiskScales || companyRiskScales.length === 0) {
            console.log("Aucune échelle détectée, création des échelles par défaut");
            await ensureDefaultScalesExist();
          } else {
            console.log(`${companyRiskScales.length} échelles trouvées pour le client`);
            
            const hasLikelihoodScale = companyRiskScales.some(
              scale => scale.scaleType?.category === 'likelihood'
            );
            
            if (!hasLikelihoodScale) {
              console.log("Échelle de probabilité manquante, création en cours");
              await setupLikelihoodScale(companyId);
              await refreshData();
            }
          }
        } catch (error) {
          console.error("Erreur lors de l'initialisation des échelles:", error);
          setError("Erreur lors de l'initialisation des échelles de risque");
        } finally {
          setIsInitialLoading(false);
        }
      };
      
      initializeData();
    }
  }, [companyId, fetchRiskScaleTypes, fetchCompanyRiskScales, ensureDefaultScalesExist, companyRiskScales, setupLikelihoodScale, refreshData]);

  useEffect(() => {
    if (Array.isArray(companyRiskScales) && Array.isArray(riskScaleTypes) && 
        !loading.riskScaleTypes && !loading.companyRiskScales) {
      const translatedTypes = riskScaleTypes.map(type => ({
        ...type,
        name: scaleNameMapping[type.name] || type.name
      }));
      
      setCachedScales(companyRiskScales.map(ensureWithLevels));
      setCachedTypes(translatedTypes);
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
    deleteScale: handleDeleteScale,
    updateScaleType: handleUpdateScaleType,
    toggleActive: handleToggleActive,
    updateLevel: handleUpdateLevel,
    refreshData,
    ensureDefaultScalesExist
  };
};

export default useRiskScalesManager;
