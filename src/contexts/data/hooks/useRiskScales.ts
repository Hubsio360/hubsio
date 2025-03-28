
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RiskScaleType, CompanyRiskScale, RiskScaleLevel } from '@/types/risk-scales';

export const useRiskScales = () => {
  const [riskScaleTypes, setRiskScaleTypes] = useState<RiskScaleType[]>([]);
  const [companyRiskScales, setCompanyRiskScales] = useState<CompanyRiskScale[]>([]);
  const [loading, setLoading] = useState<{
    scaleTypes: boolean;
    companyScales: boolean;
  }>({
    scaleTypes: false,
    companyScales: false,
  });
  const { toast } = useToast();

  // Fetch all risk scale types
  const fetchRiskScaleTypes = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, scaleTypes: true }));
      
      const { data, error } = await supabase
        .from('risk_scale_types')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setRiskScaleTypes(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching risk scale types:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, scaleTypes: false }));
    }
  }, []);

  // Fetch company risk scales with their levels
  const fetchCompanyRiskScales = useCallback(async (companyId: string) => {
    try {
      setLoading(prev => ({ ...prev, companyScales: true }));
      
      // First, fetch the company risk scales
      const { data: scalesData, error: scalesError } = await supabase
        .from('company_risk_scales')
        .select('*, risk_scale_types(*)')
        .eq('company_id', companyId);
      
      if (scalesError) {
        throw scalesError;
      }
      
      // For each scale, fetch its levels
      const scalesWithLevels = await Promise.all(
        (scalesData || []).map(async (scale) => {
          const { data: levelsData, error: levelsError } = await supabase
            .from('risk_scale_levels')
            .select('*')
            .eq('company_risk_scale_id', scale.id)
            .order('level_value', { ascending: true });
          
          if (levelsError) {
            console.error('Error fetching levels for scale:', scale.id, levelsError);
            return { ...scale, levels: [] };
          }
          
          return { ...scale, levels: levelsData || [] };
        })
      );
      
      setCompanyRiskScales(scalesWithLevels);
      return scalesWithLevels;
    } catch (error) {
      console.error('Error fetching company risk scales:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, companyScales: false }));
    }
  }, []);

  // Add a new risk scale type
  const addRiskScaleType = useCallback(async (scaleType: Omit<RiskScaleType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('risk_scale_types')
        .insert(scaleType)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setRiskScaleTypes(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding risk scale type:', error);
      throw error;
    }
  }, []);

  // Add a company risk scale
  const addCompanyRiskScale = useCallback(async ({ 
    companyId, 
    scaleTypeId, 
    isActive = true 
  }: { 
    companyId: string; 
    scaleTypeId: string; 
    isActive?: boolean; 
  }) => {
    try {
      // Check first if this combination already exists
      const { data: existingData, error: checkError } = await supabase
        .from('company_risk_scales')
        .select('id')
        .eq('company_id', companyId)
        .eq('scale_type_id', scaleTypeId)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      // If scale already exists, return it and don't create a duplicate
      if (existingData) {
        console.log('Company risk scale already exists:', existingData);
        return existingData;
      }
      
      // Create the company risk scale
      const { data, error } = await supabase
        .from('company_risk_scales')
        .insert({
          company_id: companyId,
          scale_type_id: scaleTypeId,
          is_active: isActive,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Create default levels for this scale (4 levels from low to critical)
      const defaultLevels = [
        {
          company_risk_scale_id: data.id,
          level_value: 1,
          name: 'Négligeable',
          description: 'Niveau de risque négligeable',
          color: '#4CAF50', // Green
        },
        {
          company_risk_scale_id: data.id,
          level_value: 2,
          name: 'Faible',
          description: 'Niveau de risque faible',
          color: '#FFA726', // Orange
        },
        {
          company_risk_scale_id: data.id,
          level_value: 3,
          name: 'Significatif',
          description: 'Niveau de risque significatif',
          color: '#9C27B0', // Purple
        },
        {
          company_risk_scale_id: data.id,
          level_value: 4,
          name: 'Majeur',
          description: 'Niveau de risque majeur',
          color: '#F44336', // Red
        },
      ];
      
      const { error: levelsError } = await supabase
        .from('risk_scale_levels')
        .insert(defaultLevels);
      
      if (levelsError) {
        console.error('Error creating default levels:', levelsError);
      }
      
      // Fetch the complete scale with levels
      const newScaleWithLevels = {
        ...data,
        levels: defaultLevels,
      };
      
      setCompanyRiskScales(prev => [...prev, newScaleWithLevels]);
      return newScaleWithLevels;
    } catch (error) {
      console.error('Error adding company risk scale:', error);
      throw error;
    }
  }, []);

  // Update a risk scale level
  const updateRiskScaleLevel = useCallback(async (
    levelId: string,
    updates: Partial<RiskScaleLevel>
  ) => {
    try {
      const { data, error } = await supabase
        .from('risk_scale_levels')
        .update(updates)
        .eq('id', levelId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update the local state
      setCompanyRiskScales(prev => 
        prev.map(scale => ({
          ...scale,
          levels: (scale.levels || []).map(level => 
            level.id === levelId ? { ...level, ...updates } : level
          )
        }))
      );
      
      return data;
    } catch (error) {
      console.error('Error updating risk scale level:', error);
      throw error;
    }
  }, []);

  // Toggle a risk scale active status
  const toggleRiskScaleActive = useCallback(async (
    scaleId: string,
    isActive: boolean
  ) => {
    try {
      const { data, error } = await supabase
        .from('company_risk_scales')
        .update({ is_active: isActive })
        .eq('id', scaleId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update the local state
      setCompanyRiskScales(prev => 
        prev.map(scale => 
          scale.id === scaleId ? { ...scale, is_active: isActive } : scale
        )
      );
      
      return data;
    } catch (error) {
      console.error('Error toggling risk scale active status:', error);
      throw error;
    }
  }, []);

  // Setup a likelihood scale for a company if none exists
  const setupLikelihoodScale = useCallback(async (companyId: string) => {
    try {
      // Check if a likelihood scale already exists
      const likelihoodScales = companyRiskScales.filter(scale => 
        scale.risk_scale_types?.name === 'likelihood'
      );
      
      if (likelihoodScales.length > 0) {
        console.log('Likelihood scale already exists');
        return likelihoodScales[0];
      }
      
      // Check if the likelihood scale type exists
      let likelihoodType = riskScaleTypes.find(type => type.name === 'likelihood');
      
      if (!likelihoodType) {
        // Create the likelihood scale type
        const { data, error } = await supabase
          .from('risk_scale_types')
          .insert({
            name: 'likelihood',
            description: 'Échelle de probabilité',
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        likelihoodType = data;
        setRiskScaleTypes(prev => [...prev, data]);
      }
      
      // Create the company risk scale for likelihood
      return await addCompanyRiskScale({
        companyId,
        scaleTypeId: likelihoodType.id,
      });
    } catch (error) {
      console.error('Error setting up likelihood scale:', error);
      throw error;
    }
  }, [companyRiskScales, riskScaleTypes, addCompanyRiskScale]);

  return {
    riskScaleTypes,
    companyRiskScales,
    loading,
    fetchRiskScaleTypes,
    fetchCompanyRiskScales,
    addRiskScaleType,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    toggleRiskScaleActive,
    setupLikelihoodScale,
  };
};
