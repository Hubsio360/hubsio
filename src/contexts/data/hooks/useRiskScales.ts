import { useState, useCallback } from 'react';
import { CompanyRiskScale, RiskScaleLevel, RiskScaleType, RiskScaleWithLevels } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mapping functions
const mapDbScaleTypeToRiskScaleType = (dbScaleType: any): RiskScaleType => ({
  id: dbScaleType.id,
  name: dbScaleType.name,
  description: dbScaleType.description,
  createdAt: dbScaleType.created_at,
  updatedAt: dbScaleType.updated_at
});

const mapDbCompanyScaleToCompanyRiskScale = (dbCompanyScale: any): CompanyRiskScale => ({
  id: dbCompanyScale.id,
  companyId: dbCompanyScale.company_id,
  scaleTypeId: dbCompanyScale.scale_type_id,
  isActive: dbCompanyScale.is_active,
  createdAt: dbCompanyScale.created_at,
  updatedAt: dbCompanyScale.updated_at,
  scaleType: dbCompanyScale.risk_scale_types ? mapDbScaleTypeToRiskScaleType(dbCompanyScale.risk_scale_types) : undefined
});

const mapDbScaleLevelToRiskScaleLevel = (dbScaleLevel: any): RiskScaleLevel => ({
  id: dbScaleLevel.id,
  companyRiskScaleId: dbScaleLevel.company_risk_scale_id,
  levelValue: dbScaleLevel.level_value,
  name: dbScaleLevel.name,
  description: dbScaleLevel.description,
  color: dbScaleLevel.color,
  createdAt: dbScaleLevel.created_at,
  updatedAt: dbScaleLevel.updated_at
});

const mapRiskScaleLevelToDbScaleLevel = (level: Partial<RiskScaleLevel>): Record<string, any> => {
  const dbLevel: Record<string, any> = {};
  
  if (level.companyRiskScaleId !== undefined) dbLevel.company_risk_scale_id = level.companyRiskScaleId;
  if (level.levelValue !== undefined) dbLevel.level_value = level.levelValue;
  if (level.name !== undefined) dbLevel.name = level.name;
  if (level.description !== undefined) dbLevel.description = level.description;
  if (level.color !== undefined) dbLevel.color = level.color;
  
  return dbLevel;
};

const mapCompanyRiskScaleToDbCompanyScale = (scale: Partial<CompanyRiskScale>): Record<string, any> => {
  const dbScale: Record<string, any> = {};
  
  if (scale.companyId !== undefined) dbScale.company_id = scale.companyId;
  if (scale.scaleTypeId !== undefined) dbScale.scale_type_id = scale.scaleTypeId;
  if (scale.isActive !== undefined) dbScale.is_active = scale.isActive;
  
  return dbScale;
};

export const useRiskScales = () => {
  const [riskScaleTypes, setRiskScaleTypes] = useState<RiskScaleType[]>([]);
  const [companyRiskScales, setCompanyRiskScales] = useState<RiskScaleWithLevels[]>([]);
  const [loading, setLoading] = useState({
    scaleTypes: false,
    companyScales: false
  });
  const { toast } = useToast();

  // Fetch all risk scale types
  const fetchRiskScaleTypes = useCallback(async (): Promise<RiskScaleType[]> => {
    setLoading(prev => ({ ...prev, scaleTypes: true }));
    try {
      const { data, error } = await supabase
        .from('risk_scale_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching risk scale types:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les types d'échelles de risque",
          variant: "destructive",
        });
        return [];
      }
      
      const fetchedTypes = (data || []).map(mapDbScaleTypeToRiskScaleType);
      setRiskScaleTypes(fetchedTypes);
      return fetchedTypes;
    } catch (error) {
      console.error('Error fetching risk scale types:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, scaleTypes: false }));
    }
  }, [toast]);

  // Fetch company risk scales with their levels
  const fetchCompanyRiskScales = useCallback(async (companyId: string): Promise<RiskScaleWithLevels[]> => {
    setLoading(prev => ({ ...prev, companyScales: true }));
    try {
      // Fetch company scales with their types
      const { data: scalesData, error: scalesError } = await supabase
        .from('company_risk_scales')
        .select(`
          *,
          risk_scale_types(*)
        `)
        .eq('company_id', companyId);
      
      if (scalesError) {
        console.error('Error fetching company risk scales:', scalesError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les échelles de risque de l'entreprise",
          variant: "destructive",
        });
        return [];
      }

      const companyScales = (scalesData || []).map(mapDbCompanyScaleToCompanyRiskScale);
      
      // Fetch levels for each scale
      const scalesWithLevels: RiskScaleWithLevels[] = await Promise.all(
        companyScales.map(async (scale) => {
          const { data: levelsData, error: levelsError } = await supabase
            .from('risk_scale_levels')
            .select('*')
            .eq('company_risk_scale_id', scale.id)
            .order('level_value');
          
          if (levelsError) {
            console.error(`Error fetching levels for scale ${scale.id}:`, levelsError);
            return { ...scale, levels: [], scaleType: scale.scaleType! };
          }
          
          const levels = (levelsData || []).map(mapDbScaleLevelToRiskScaleLevel);
          return { ...scale, levels, scaleType: scale.scaleType! };
        })
      );
      
      setCompanyRiskScales(scalesWithLevels);
      return scalesWithLevels;
    } catch (error) {
      console.error('Error fetching company risk scales:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, companyScales: false }));
    }
  }, [toast]);

  // Update a risk scale level
  const updateRiskScaleLevel = useCallback(async (levelId: string, updates: Partial<RiskScaleLevel>): Promise<RiskScaleLevel | null> => {
    try {
      const dbUpdates = mapRiskScaleLevelToDbScaleLevel(updates);
      
      const { data, error } = await supabase
        .from('risk_scale_levels')
        .update(dbUpdates)
        .eq('id', levelId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk scale level:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le niveau d'échelle",
          variant: "destructive",
        });
        return null;
      }
      
      const updatedLevel = mapDbScaleLevelToRiskScaleLevel(data);
      
      // Update the local state
      setCompanyRiskScales(prev => 
        prev.map(scale => {
          if (scale.levels.some(level => level.id === levelId)) {
            return {
              ...scale,
              levels: scale.levels.map(level => 
                level.id === levelId ? updatedLevel : level
              )
            };
          }
          return scale;
        })
      );
      
      toast({
        title: "Succès",
        description: "Niveau d'échelle mis à jour avec succès",
      });
      
      return updatedLevel;
    } catch (error) {
      console.error('Error updating risk scale level:', error);
      return null;
    }
  }, [toast]);

  // Toggle a company risk scale active status
  const toggleRiskScaleActive = useCallback(async (scaleId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_risk_scales')
        .update({ is_active: isActive })
        .eq('id', scaleId);
      
      if (error) {
        console.error('Error toggling risk scale active status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de changer le statut de l'échelle",
          variant: "destructive",
        });
        return false;
      }
      
      // Update the local state
      setCompanyRiskScales(prev => 
        prev.map(scale => 
          scale.id === scaleId ? { ...scale, isActive } : scale
        )
      );
      
      toast({
        title: "Succès",
        description: `Échelle ${isActive ? 'activée' : 'désactivée'} avec succès`,
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling risk scale active status:', error);
      return false;
    }
  }, [toast]);

  // Create a new scale type
  const addRiskScaleType = useCallback(async (name: string, description: string): Promise<RiskScaleType | null> => {
    try {
      // Check if scale type already exists
      const { data: existingTypes, error: checkError } = await supabase
        .from('risk_scale_types')
        .select('*')
        .eq('name', name);
      
      if (checkError) {
        console.error('Error checking existing scale types:', checkError);
        return null;
      }
      
      // If the scale type already exists, just return it
      if (existingTypes && existingTypes.length > 0) {
        return mapDbScaleTypeToRiskScaleType(existingTypes[0]);
      }
      
      // If not, create a new one
      const { data, error } = await supabase
        .from('risk_scale_types')
        .insert([{ name, description }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk scale type:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le type d'échelle",
          variant: "destructive",
        });
        return null;
      }
      
      const newScaleType = mapDbScaleTypeToRiskScaleType(data);
      setRiskScaleTypes(prev => [...prev, newScaleType]);
      
      toast({
        title: "Succès",
        description: "Type d'échelle ajouté avec succès",
      });
      
      return newScaleType;
    } catch (error) {
      console.error('Error adding risk scale type:', error);
      return null;
    }
  }, [toast]);

  // Add a new scale with levels for a company
  const addCompanyRiskScale = useCallback(async (
    companyId: string, 
    scaleTypeId: string, 
    levels: Omit<RiskScaleLevel, 'id' | 'companyRiskScaleId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<RiskScaleWithLevels | null> => {
    try {
      // Check if company already has this scale type
      const { data: existingScales, error: checkError } = await supabase
        .from('company_risk_scales')
        .select('*')
        .eq('company_id', companyId)
        .eq('scale_type_id', scaleTypeId);
      
      if (checkError) {
        console.error('Error checking existing company scales:', checkError);
        return null;
      }
      
      // If the scale already exists, return null or update it
      if (existingScales && existingScales.length > 0) {
        return null; // Or implement update logic
      }
      
      // Create the new scale
      const { data: scaleData, error: scaleError } = await supabase
        .from('company_risk_scales')
        .insert([{ 
          company_id: companyId, 
          scale_type_id: scaleTypeId,
          is_active: true
        }])
        .select()
        .single();
      
      if (scaleError) {
        console.error('Error adding company risk scale:', scaleError);
        return null;
      }
      
      // Create the levels for this scale
      const levelsToInsert = levels.map(level => ({
        company_risk_scale_id: scaleData.id,
        level_value: level.levelValue,
        name: level.name,
        description: level.description,
        color: level.color
      }));
      
      const { data: levelsData, error: levelsError } = await supabase
        .from('risk_scale_levels')
        .insert(levelsToInsert)
        .select();
      
      if (levelsError) {
        console.error('Error adding risk scale levels:', levelsError);
        // Consider rolling back the scale creation here
        return null;
      }
      
      // Fetch the complete scale with its type and levels
      const createdScale = await fetchCompanyRiskScales(companyId).then(
        scales => scales.find(s => s.id === scaleData.id)
      );
      
      return createdScale || null;
    } catch (error) {
      console.error('Error adding company risk scale:', error);
      return null;
    }
  }, [fetchCompanyRiskScales]);

  // Function to setup a likelihood scale for a company if it doesn't exist
  const setupLikelihoodScale = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      // First, check if we already have the likelihood scale type
      let likelihoodScaleType = riskScaleTypes.find(scale => scale.name === 'likelihood');
      
      // If not in state, try to fetch from DB or create it
      if (!likelihoodScaleType) {
        likelihoodScaleType = await addRiskScaleType('likelihood', 'Échelle de probabilité');
        if (!likelihoodScaleType) return false;
      }
      
      // Check if company already has this scale
      const existingScale = companyRiskScales.find(
        scale => scale.companyId === companyId && scale.scaleType.name === 'likelihood'
      );
      
      if (existingScale) return true; // Already exists
      
      // Define the likelihood levels
      const likelihoodLevels = [
        {
          levelValue: 1,
          name: 'Peu probable',
          description: 'L\'évènement n\'a que très peu de chances moyennes de se produire sur la période (1 fois tous les 10 ans)',
          color: '#4CAF50'
        },
        {
          levelValue: 2,
          name: 'Relativement probable',
          description: 'L\'évènement a des chances moyennes de se produire sur la période (1 fois tous les 5 ans)',
          color: '#FFA726'
        },
        {
          levelValue: 3,
          name: 'Hautement probable',
          description: 'L\'évènement a de très grandes chances de se produire sur la période (1 fois tous les 2 ans)',
          color: '#9C27B0'
        },
        {
          levelValue: 4,
          name: 'Certain',
          description: 'L\'évènement a de très grandes chances de se produire sur la période (1 fois par an)',
          color: '#F44336'
        }
      ];
      
      // Create the scale with levels
      const result = await addCompanyRiskScale(companyId, likelihoodScaleType.id, likelihoodLevels);
      
      return result !== null;
    } catch (error) {
      console.error('Error setting up likelihood scale:', error);
      return false;
    }
  }, [riskScaleTypes, companyRiskScales, addRiskScaleType, addCompanyRiskScale]);

  return {
    riskScaleTypes,
    companyRiskScales,
    loading,
    fetchRiskScaleTypes,
    fetchCompanyRiskScales,
    updateRiskScaleLevel,
    toggleRiskScaleActive,
    addRiskScaleType,
    addCompanyRiskScale,
    setupLikelihoodScale
  };
};
