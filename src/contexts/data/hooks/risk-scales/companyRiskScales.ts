
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyRiskScale, RiskScaleLevel, RiskScaleType, RiskScaleWithLevels } from '@/types';
import { useRiskScaleTypes } from './riskScaleTypes';
import { useToast } from '@/hooks/use-toast';

export const useCompanyRiskScales = () => {
  const { normalizeRiskScaleType } = useRiskScaleTypes();
  const { toast } = useToast();
  
  // Convert database response to properly typed RiskScaleWithLevels
  const mapToRiskScaleWithLevels = useCallback((scale: any, levels: any[], scaleType: RiskScaleType): RiskScaleWithLevels => {
    return {
      ...scale,
      levels: levels || [],
      scaleType: {
        ...scaleType,
        // Normalize category to one of the expected values or default to 'impact'
        category: scaleType.category === 'likelihood' ? 'likelihood' : 'impact'
      }
    };
  }, []);

  // Fetch company risk scales with their associated levels
  const fetchCompanyRiskScales = useCallback(async (
    companyId: string, 
    riskScaleTypes: RiskScaleType[]
  ): Promise<RiskScaleWithLevels[]> => {
    try {
      console.log(`Fetching risk scales for company ${companyId}`);
      
      // Fetch company risk scales with their scale types
      const { data, error } = await supabase
        .from('company_risk_scales')
        .select('*, risk_scale_types(*)')
        .eq('company_id', companyId);
      
      if (error) {
        console.error('Error fetching company risk scales:', error);
        return [];
      }

      console.log(`Found ${data.length} risk scales for company`);

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
            return mapToRiskScaleWithLevels(scale, [], scale.risk_scale_types || {
              id: '',
              name: 'Type inconnu',
              description: '',
              category: 'impact'
            });
          }
          
          return mapToRiskScaleWithLevels(scale, levels || [], scale.risk_scale_types || {
            id: '',
            name: 'Type inconnu',
            description: '',
            category: 'impact'
          });
        })
      );
      
      return scalesWithLevels;
    } catch (error) {
      console.error('Error fetching company risk scales with levels:', error);
      return [];
    }
  }, [mapToRiskScaleWithLevels]);

  // Add a company risk scale
  const addCompanyRiskScale = useCallback(async (
    companyId: string,
    scaleTypeId: string,
    levels: Omit<RiskScaleLevel, 'id' | 'companyRiskScaleId' | 'createdAt' | 'updatedAt'>[],
    riskScaleTypes: RiskScaleType[]
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
      
      if (scaleError || !scaleData) {
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
        description: '',
        category: 'impact'
      };
      
      const newScaleWithLevels: RiskScaleWithLevels = {
        ...companyScale,
        levels: levelsData || [],
        scaleType
      };
      
      return newScaleWithLevels;
    } catch (error) {
      console.error('Error adding company risk scale with levels:', error);
      return null;
    }
  }, []);

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
      
      if (error || !data) {
        console.error('Error updating risk scale level:', error);
        return null;
      }
      
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
      
      return true;
    } catch (error) {
      console.error('Error deleting risk scale:', error);
      return false;
    }
  }, [toast]);

  return {
    fetchCompanyRiskScales,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    toggleRiskScaleActive,
    deleteRiskScale
  };
};
