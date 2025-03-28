
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RiskScaleType, CompanyRiskScale, RiskScaleLevel, RiskScaleWithLevels } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useRiskScales = () => {
  const [riskScaleTypes, setRiskScaleTypes] = useState<RiskScaleType[]>([]);
  const [companyRiskScales, setCompanyRiskScales] = useState<RiskScaleWithLevels[]>([]);
  const [loading, setLoading] = useState({
    riskScaleTypes: false,
    companyRiskScales: false
  });
  const { toast } = useToast();

  // Fetch risk scale types
  const fetchRiskScaleTypes = useCallback(async (): Promise<RiskScaleType[]> => {
    setLoading(prev => ({ ...prev, riskScaleTypes: true }));
    try {
      const { data, error } = await supabase
        .from('risk_scale_types')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching risk scale types:', error);
        return [];
      }
      
      const fetchedTypes = data as RiskScaleType[];
      setRiskScaleTypes(fetchedTypes);
      return fetchedTypes;
    } catch (error) {
      console.error('Error fetching risk scale types:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, riskScaleTypes: false }));
    }
  }, []);

  // Fetch company risk scales with their associated levels
  const fetchCompanyRiskScales = useCallback(async (companyId: string): Promise<RiskScaleWithLevels[]> => {
    setLoading(prev => ({ ...prev, companyRiskScales: true }));
    try {
      // Fetch company risk scales with their scale types
      const { data, error } = await supabase
        .from('company_risk_scales')
        .select('*, risk_scale_types(*)')
        .eq('company_id', companyId);
      
      if (error) {
        console.error('Error fetching company risk scales:', error);
        return [];
      }

      // Now for each company scale, fetch its levels
      const scalesWithLevels: RiskScaleWithLevels[] = await Promise.all(
        data.map(async (scale) => {
          const { data: levels, error: levelsError } = await supabase
            .from('risk_scale_levels')
            .select('*')
            .eq('company_risk_scale_id', scale.id)
            .order('level_value', { ascending: true });
          
          if (levelsError) {
            console.error('Error fetching risk scale levels:', levelsError);
            return {
              ...scale,
              levels: [],
              scaleType: scale.risk_scale_types || {
                id: '',
                name: 'Type inconnu',
                description: '',
                category: 'impact'
              }
            };
          }
          
          return {
            ...scale,
            levels: levels || [],
            scaleType: scale.risk_scale_types || {
              id: '',
              name: 'Type inconnu',
              description: '',
              category: 'impact'
            }
          };
        })
      );
      
      setCompanyRiskScales(scalesWithLevels);
      return scalesWithLevels;
    } catch (error) {
      console.error('Error fetching company risk scales with levels:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, companyRiskScales: false }));
    }
  }, []);

  // Add a new risk scale type
  const addRiskScaleType = useCallback(async (
    name: string,
    description: string
  ): Promise<RiskScaleType | null> => {
    try {
      const { data, error } = await supabase
        .from('risk_scale_types')
        .insert([{
          name,
          description
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk scale type:', error);
        return null;
      }
      
      const newType = data as RiskScaleType;
      setRiskScaleTypes(prev => [...prev, newType]);
      return newType;
    } catch (error) {
      console.error('Error adding risk scale type:', error);
      return null;
    }
  }, []);

  // Update a risk scale type
  const updateRiskScaleType = useCallback(async (
    scaleTypeId: string,
    name: string,
    description: string
  ): Promise<RiskScaleType | null> => {
    try {
      const { data, error } = await supabase
        .from('risk_scale_types')
        .update({
          name,
          description
        })
        .eq('id', scaleTypeId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk scale type:', error);
        return null;
      }
      
      const updatedType = data as RiskScaleType;
      setRiskScaleTypes(prev => 
        prev.map(type => type.id === scaleTypeId ? updatedType : type)
      );
      return updatedType;
    } catch (error) {
      console.error('Error updating risk scale type:', error);
      return null;
    }
  }, []);

  // Add a company risk scale
  const addCompanyRiskScale = useCallback(async (
    companyId: string,
    scaleTypeId: string,
    levels: Omit<RiskScaleLevel, 'id' | 'companyRiskScaleId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<RiskScaleWithLevels | null> => {
    try {
      // First create the company risk scale
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
      
      const companyScale = scaleData as CompanyRiskScale;
      
      // Create default levels if no levels are provided
      if (levels.length === 0) {
        levels = [
          { 
            name: 'Négligeable', 
            description: 'Niveau de risque négligeable', 
            color: '#4CAF50', 
            levelValue: 1 
          },
          { 
            name: 'Faible', 
            description: 'Niveau de risque faible', 
            color: '#FFA726', 
            levelValue: 2 
          },
          { 
            name: 'Significatif', 
            description: 'Niveau de risque significatif', 
            color: '#9C27B0', 
            levelValue: 3 
          },
          { 
            name: 'Majeur', 
            description: 'Niveau de risque majeur', 
            color: '#F44336', 
            levelValue: 4 
          }
        ];
      }
      
      // Now add the levels
      const levelsToInsert = levels.map(level => ({
        company_risk_scale_id: companyScale.id,
        name: level.name,
        description: level.description,
        color: level.color,
        level_value: level.levelValue
      }));
      
      const { data: levelsData, error: levelsError } = await supabase
        .from('risk_scale_levels')
        .insert(levelsToInsert)
        .select();
      
      if (levelsError) {
        console.error('Error adding risk scale levels:', levelsError);
        // Continue despite error, but log it
      }
      
      // Get the scale type
      const scaleType = riskScaleTypes.find(type => type.id === scaleTypeId) || {
        id: scaleTypeId,
        name: 'Type inconnu',
        description: ''
      };
      
      const newScaleWithLevels: RiskScaleWithLevels = {
        ...companyScale,
        levels: levelsData || [],
        scaleType
      };
      
      setCompanyRiskScales(prev => [...prev, newScaleWithLevels]);
      return newScaleWithLevels;
    } catch (error) {
      console.error('Error adding company risk scale with levels:', error);
      return null;
    }
  }, [riskScaleTypes]);

  // Update a risk scale level
  const updateRiskScaleLevel = useCallback(async (
    levelId: string,
    updatedData: Partial<RiskScaleLevel>
  ): Promise<RiskScaleLevel | null> => {
    try {
      const updates: Record<string, any> = {};
      if (updatedData.name !== undefined) updates.name = updatedData.name;
      if (updatedData.description !== undefined) updates.description = updatedData.description;
      if (updatedData.color !== undefined) updates.color = updatedData.color;
      if (updatedData.levelValue !== undefined) updates.level_value = updatedData.levelValue;
      
      const { data, error } = await supabase
        .from('risk_scale_levels')
        .update(updates)
        .eq('id', levelId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating risk scale level:', error);
        return null;
      }
      
      // Update the level in the companyRiskScales state
      setCompanyRiskScales(prev => 
        prev.map(scale => ({
          ...scale,
          levels: scale.levels.map(level => 
            level.id === levelId ? data as RiskScaleLevel : level
          )
        }))
      );
      
      return data as RiskScaleLevel;
    } catch (error) {
      console.error('Error updating risk scale level:', error);
      return null;
    }
  }, []);

  // Toggle active state of a risk scale
  const toggleRiskScaleActive = useCallback(async (
    scaleId: string,
    isActive: boolean
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_risk_scales')
        .update({ is_active: isActive })
        .eq('id', scaleId);
      
      if (error) {
        console.error('Error toggling risk scale active state:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling risk scale active state:', error);
      return false;
    }
  }, []);

  // Delete a risk scale
  const deleteRiskScale = useCallback(async (scaleId: string): Promise<boolean> => {
    try {
      console.log("Suppression de l'échelle dans la base de données:", scaleId);
      
      // First delete the levels
      const { error: levelsError } = await supabase
        .from('risk_scale_levels')
        .delete()
        .eq('company_risk_scale_id', scaleId);
      
      if (levelsError) {
        console.error('Error deleting risk scale levels:', levelsError);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors de la suppression des niveaux de risque",
        });
        return false;
      }
      
      // Then delete the scale itself
      const { error: scaleError } = await supabase
        .from('company_risk_scales')
        .delete()
        .eq('id', scaleId);
      
      if (scaleError) {
        console.error('Error deleting risk scale:', scaleError);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors de la suppression de l'échelle de risque",
        });
        return false;
      }
      
      // Update state optimistically
      setCompanyRiskScales(prev => prev.filter(scale => scale.id !== scaleId));
      
      return true;
    } catch (error) {
      console.error('Error deleting risk scale:', error);
      return false;
    }
  }, [toast]);

  // Setup likelihood scale
  const setupLikelihoodScale = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      // First check if a likelihood scale type already exists
      let likelihoodType = riskScaleTypes.find(type => type.name === 'Échelle de probabilité');
      
      if (!likelihoodType) {
        // Create a new likelihood scale type
        const { data, error } = await supabase
          .from('risk_scale_types')
          .insert([{
            name: 'Échelle de probabilité',
            description: 'L\'échelle de probabilité indique la fréquence de survenue d\'un risque, allant du rare au presque certain.',
            category: 'likelihood'
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating likelihood scale type:', error);
          return false;
        }
        
        likelihoodType = data as RiskScaleType;
        setRiskScaleTypes(prev => [...prev, likelihoodType]);
      }
      
      // Check if the company already has this scale
      const existingScale = companyRiskScales.find(
        scale => scale.company_id === companyId && scale.scale_type_id === likelihoodType?.id
      );
      
      if (existingScale) {
        // Scale already exists, no need to create it
        return true;
      }
      
      // Create the likelihood scale for the company
      const levels = [
        { 
          name: 'Peu probable', 
          description: 'L\'évènement n\'a que très peu de chances moyennes de se produire sur la période (1 fois tous les 10 ans)', 
          color: '#4CAF50', 
          levelValue: 1 
        },
        { 
          name: 'Relativement probable', 
          description: 'L\'évènement a des chances moyennes de se produire sur la période (1 fois tous les 5 ans)', 
          color: '#FFA726', 
          levelValue: 2 
        },
        { 
          name: 'Hautement probable', 
          description: 'L\'évènement a de très grandes chances de se produire sur la période (1 fois tous les 2 ans)', 
          color: '#9C27B0', 
          levelValue: 3 
        },
        { 
          name: 'Certain', 
          description: 'L\'évènement a de très grandes chances de se produire sur la période (1 fois par an)', 
          color: '#F44336', 
          levelValue: 4 
        }
      ];
      
      await addCompanyRiskScale(companyId, likelihoodType.id, levels);
      
      return true;
    } catch (error) {
      console.error('Error setting up likelihood scale:', error);
      return false;
    }
  }, [riskScaleTypes, companyRiskScales, addCompanyRiskScale]);

  return {
    riskScaleTypes,
    companyRiskScales,
    loading,
    fetchRiskScaleTypes,
    fetchCompanyRiskScales,
    addRiskScaleType,
    updateRiskScaleType,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    toggleRiskScaleActive,
    deleteRiskScale,
    setupLikelihoodScale
  };
};
