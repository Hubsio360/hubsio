
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RiskScaleType } from '@/types';

export const useRiskScaleTypes = () => {
  // Helper function to normalize risk scale type data
  const normalizeRiskScaleType = useCallback((data: any): RiskScaleType => {
    return {
      ...data,
      category: data.category === 'likelihood' ? 'likelihood' : 'impact'
    };
  }, []);
  
  // Fetch risk scale types
  const fetchRiskScaleTypes = useCallback(async (): Promise<RiskScaleType[]> => {
    try {
      const { data, error } = await supabase
        .from('risk_scale_types')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching risk scale types:', error);
        return [];
      }
      
      // Ensure the data is properly typed
      const fetchedTypes = data.map(type => ({
        ...type,
        // Normalize category to one of the expected values or default to 'impact'
        category: type.category === 'likelihood' ? 'likelihood' : 'impact'
      })) as RiskScaleType[];
      
      return fetchedTypes;
    } catch (error) {
      console.error('Error fetching risk scale types:', error);
      return [];
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
          description,
          category: 'impact' // Default category
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding risk scale type:', error);
        return null;
      }
      
      // Normalize the category
      const newType: RiskScaleType = {
        ...data as RiskScaleType,
        category: data.category === 'likelihood' ? 'likelihood' : 'impact'
      };
      
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
      
      const updatedType = normalizeRiskScaleType(data);
      return updatedType;
    } catch (error) {
      console.error('Error updating risk scale type:', error);
      return null;
    }
  }, [normalizeRiskScaleType]);

  return {
    fetchRiskScaleTypes,
    addRiskScaleType,
    updateRiskScaleType,
    normalizeRiskScaleType
  };
};
