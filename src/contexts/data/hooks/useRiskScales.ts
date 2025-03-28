import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RiskScaleType, CompanyRiskScale, RiskScaleLevel, RiskScaleWithLevels } from '@/types/risk-scales';

const convertDbRiskScaleType = (dbType: any): RiskScaleType => {
  return {
    id: dbType.id,
    name: dbType.name,
    description: dbType.description || '',
    category: dbType.category || (dbType.name.includes('likelihood') ? 'likelihood' : 'impact'),
    createdAt: dbType.created_at,
    updatedAt: dbType.updated_at,
    created_at: dbType.created_at,
    updated_at: dbType.updated_at
  };
};

const convertDbRiskScaleLevel = (dbLevel: any): RiskScaleLevel => {
  return {
    id: dbLevel.id,
    companyRiskScaleId: dbLevel.company_risk_scale_id,
    levelValue: dbLevel.level_value,
    name: dbLevel.name,
    description: dbLevel.description || '',
    color: dbLevel.color || '',
    createdAt: dbLevel.created_at,
    updatedAt: dbLevel.updated_at,
    company_risk_scale_id: dbLevel.company_risk_scale_id,
    level_value: dbLevel.level_value,
    created_at: dbLevel.created_at,
    updated_at: dbLevel.updated_at
  };
};

const convertDbCompanyRiskScale = (dbScale: any, levels: RiskScaleLevel[] = []): RiskScaleWithLevels => {
  const scaleType = dbScale.risk_scale_types ? convertDbRiskScaleType(dbScale.risk_scale_types) : {
    id: '',
    name: 'Type inconnu',
    description: '',
    createdAt: '',
    updatedAt: '',
    created_at: '',
    updated_at: ''
  };
  
  return {
    id: dbScale.id,
    companyId: dbScale.company_id,
    scaleTypeId: dbScale.scale_type_id,
    isActive: dbScale.is_active,
    createdAt: dbScale.created_at,
    updatedAt: dbScale.updated_at,
    company_id: dbScale.company_id,
    scale_type_id: dbScale.scale_type_id,
    is_active: dbScale.is_active,
    created_at: dbScale.created_at,
    updated_at: dbScale.updated_at,
    levels: levels,
    scaleType: scaleType,
    risk_scale_types: dbScale.risk_scale_types
  };
};

export const useRiskScales = () => {
  const [riskScaleTypes, setRiskScaleTypes] = useState<RiskScaleType[]>([]);
  const [companyRiskScales, setCompanyRiskScales] = useState<RiskScaleWithLevels[]>([]);
  const [loading, setLoading] = useState<{
    scaleTypes: boolean;
    companyScales: boolean;
  }>({
    scaleTypes: false,
    companyScales: false,
  });
  const { toast } = useToast();

  const fetchRiskScaleTypes = useCallback(async (): Promise<RiskScaleType[]> => {
    try {
      setLoading(prev => ({ ...prev, scaleTypes: true }));
      
      const { data, error } = await supabase
        .from('risk_scale_types')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      const convertedData = data.map(convertDbRiskScaleType);
      setRiskScaleTypes(convertedData);
      return convertedData;
    } catch (error) {
      console.error('Error fetching risk scale types:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, scaleTypes: false }));
    }
  }, []);

  const fetchCompanyRiskScales = useCallback(async (companyId: string): Promise<RiskScaleWithLevels[]> => {
    try {
      setLoading(prev => ({ ...prev, companyScales: true }));
      
      const { data: scalesData, error: scalesError } = await supabase
        .from('company_risk_scales')
        .select('*, risk_scale_types(*)')
        .eq('company_id', companyId);
      
      if (scalesError) {
        throw scalesError;
      }
      
      const scalesWithLevels = await Promise.all(
        (scalesData || []).map(async (scale) => {
          const { data: levelsData, error: levelsError } = await supabase
            .from('risk_scale_levels')
            .select('*')
            .eq('company_risk_scale_id', scale.id)
            .order('level_value', { ascending: true });
          
          if (levelsError) {
            console.error('Error fetching levels for scale:', scale.id, levelsError);
            return convertDbCompanyRiskScale(scale, []);
          }
          
          const convertedLevels = (levelsData || []).map(convertDbRiskScaleLevel);
          return convertDbCompanyRiskScale(scale, convertedLevels);
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

  const addRiskScaleType = useCallback(async (name: string, description: string, category: 'impact' | 'likelihood' = 'impact'): Promise<RiskScaleType | null> => {
    try {
      const { data, error } = await supabase
        .from('risk_scale_types')
        .insert({
          name,
          description,
          category
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const convertedData = convertDbRiskScaleType(data);
      setRiskScaleTypes(prev => [...prev, convertedData]);
      return convertedData;
    } catch (error) {
      console.error('Error adding risk scale type:', error);
      throw error;
    }
  }, []);

  const addCompanyRiskScale = useCallback(async (
    companyId: string, 
    scaleTypeId: string, 
    levels: Omit<RiskScaleLevel, 'id' | 'companyRiskScaleId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<RiskScaleWithLevels | null> => {
    try {
      const { data: existingData, error: checkError } = await supabase
        .from('company_risk_scales')
        .select('id')
        .eq('company_id', companyId)
        .eq('scale_type_id', scaleTypeId)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingData) {
        console.log('Company risk scale already exists:', existingData);
        const { data: completeScale, error: fetchError } = await supabase
          .from('company_risk_scales')
          .select('*, risk_scale_types(*)')
          .eq('id', existingData.id)
          .single();
          
        if (fetchError) {
          throw fetchError;
        }
        
        const { data: levelsData, error: levelsError } = await supabase
          .from('risk_scale_levels')
          .select('*')
          .eq('company_risk_scale_id', existingData.id)
          .order('level_value', { ascending: true });
          
        if (levelsError) {
          throw levelsError;
        }
        
        const convertedLevels = (levelsData || []).map(convertDbRiskScaleLevel);
        const fullScale = convertDbCompanyRiskScale(completeScale, convertedLevels);
        return fullScale;
      }
      
      const { data, error } = await supabase
        .from('company_risk_scales')
        .insert({
          company_id: companyId,
          scale_type_id: scaleTypeId,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const defaultLevels = [
        {
          company_risk_scale_id: data.id,
          level_value: 1,
          name: 'Négligeable',
          description: 'Niveau de risque négligeable',
          color: '#4CAF50',
        },
        {
          company_risk_scale_id: data.id,
          level_value: 2,
          name: 'Faible',
          description: 'Niveau de risque faible',
          color: '#FFA726',
        },
        {
          company_risk_scale_id: data.id,
          level_value: 3,
          name: 'Significatif',
          description: 'Niveau de risque significatif',
          color: '#9C27B0',
        },
        {
          company_risk_scale_id: data.id,
          level_value: 4,
          name: 'Majeur',
          description: 'Niveau de risque majeur',
          color: '#F44336',
        },
      ];
      
      const { data: levelsData, error: levelsError } = await supabase
        .from('risk_scale_levels')
        .insert(defaultLevels)
        .select();
      
      if (levelsError) {
        console.error('Error creating default levels:', levelsError);
      }
      
      const { data: scaleType, error: typeError } = await supabase
        .from('risk_scale_types')
        .select('*')
        .eq('id', scaleTypeId)
        .single();
        
      if (typeError) {
        console.error('Error fetching scale type:', typeError);
      }
      
      const convertedLevels = (levelsData || []).map(convertDbRiskScaleLevel);
      
      const newScaleWithLevels: RiskScaleWithLevels = {
        id: data.id,
        companyId: data.company_id,
        scaleTypeId: data.scale_type_id,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        company_id: data.company_id,
        scale_type_id: data.scale_type_id,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        levels: convertedLevels,
        scaleType: scaleType ? convertDbRiskScaleType(scaleType) : {
          id: scaleTypeId,
          name: 'Type inconnu',
          description: '',
          createdAt: '',
          updatedAt: '',
          created_at: '',
          updated_at: ''
        }
      };
      
      setCompanyRiskScales(prev => [...prev, newScaleWithLevels]);
      return newScaleWithLevels;
    } catch (error) {
      console.error('Error adding company risk scale:', error);
      throw error;
    }
  }, []);

  const updateRiskScaleLevel = useCallback(async (
    levelId: string,
    updates: Partial<RiskScaleLevel>
  ): Promise<RiskScaleLevel | null> => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.color) dbUpdates.color = updates.color;
      if (updates.levelValue) dbUpdates.level_value = updates.levelValue;
      
      const { data, error } = await supabase
        .from('risk_scale_levels')
        .update(dbUpdates)
        .eq('id', levelId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setCompanyRiskScales(prev => 
        prev.map(scale => ({
          ...scale,
          levels: (scale.levels || []).map(level => 
            level.id === levelId ? {
              ...level,
              ...updates,
              name: updates.name || level.name,
              description: updates.description || level.description,
              color: updates.color || level.color,
              level_value: updates.levelValue || level.level_value
            } : level
          )
        }))
      );
      
      return convertDbRiskScaleLevel(data);
    } catch (error) {
      console.error('Error updating risk scale level:', error);
      throw error;
    }
  }, []);

  const updateRiskScaleType = useCallback(async (
    scaleTypeId: string,
    name: string,
    description: string
  ): Promise<RiskScaleType | null> => {
    try {
      const updates: any = {
        name: name,
        description: description
      };
      
      const { data, error } = await supabase
        .from('risk_scale_types')
        .update(updates)
        .eq('id', scaleTypeId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const convertedData = convertDbRiskScaleType(data);
      
      setRiskScaleTypes(prev => 
        prev.map(type => 
          type.id === scaleTypeId ? {
            ...type,
            name: name || type.name,
            description: description || type.description
          } : type
        )
      );
      
      return convertedData;
    } catch (error) {
      console.error('Error updating risk scale type:', error);
      throw error;
    }
  }, []);

  const toggleRiskScaleActive = useCallback(async (
    scaleId: string,
    isActive: boolean
  ): Promise<boolean> => {
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
      
      setCompanyRiskScales(prev => 
        prev.map(scale => 
          scale.id === scaleId ? {
            ...scale,
            isActive: isActive,
            is_active: isActive
          } : scale
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error toggling risk scale active status:', error);
      throw error;
    }
  }, []);

  const deleteRiskScale = useCallback(async (scaleId: string): Promise<boolean> => {
    try {
      const { error: levelError } = await supabase
        .from('risk_scale_levels')
        .delete()
        .eq('company_risk_scale_id', scaleId);
        
      if (levelError) {
        console.error('Error deleting risk scale levels:', levelError);
        throw levelError;
      }
      
      const { error } = await supabase
        .from('company_risk_scales')
        .delete()
        .eq('id', scaleId);
        
      if (error) {
        throw error;
      }
      
      setCompanyRiskScales(prev => prev.filter(scale => scale.id !== scaleId));
      
      return true;
    } catch (error) {
      console.error('Error deleting risk scale:', error);
      throw error;
    }
  }, []);

  const setupLikelihoodScale = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      const likelihoodScales = companyRiskScales.filter(scale => {
        const scaleCategory = scale.scaleType?.category;
        return scaleCategory === 'likelihood';
      });
      
      if (likelihoodScales.length > 0) {
        console.log('Likelihood scale already exists');
        return true;
      }
      
      let likelihoodType = riskScaleTypes.find(type => type.category === 'likelihood');
      
      if (!likelihoodType) {
        const { data, error } = await supabase
          .from('risk_scale_types')
          .insert({
            name: 'Échelle de probabilité',
            description: 'Échelle standard de probabilité',
            category: 'likelihood'
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        likelihoodType = convertDbRiskScaleType(data);
        setRiskScaleTypes(prev => [...prev, likelihoodType]);
      }
      
      await addCompanyRiskScale(companyId, likelihoodType.id, []);
      return true;
    } catch (error) {
      console.error('Error setting up likelihood scale:', error);
      throw error;
    }
  }, [companyRiskScales, riskScaleTypes, addCompanyRiskScale]);

  return {
    riskScaleTypes,
    companyRiskScales,
    loading: {
      scaleTypes: loading.scaleTypes,
      companyScales: loading.companyScales,
    },
    fetchRiskScaleTypes,
    fetchCompanyRiskScales,
    addRiskScaleType,
    addCompanyRiskScale,
    updateRiskScaleLevel,
    updateRiskScaleType,
    toggleRiskScaleActive,
    deleteRiskScale,
    setupLikelihoodScale,
  };
};
