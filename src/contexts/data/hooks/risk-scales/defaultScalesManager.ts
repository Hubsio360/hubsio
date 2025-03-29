
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDefaultScalesManager = () => {
  const { toast } = useToast();

  // Ensure default risk scales exist for a company
  const ensureDefaultScalesExist = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      console.log("Ensuring default scales exist for company:", companyId);
      
      // Verify if scales already exist for this company
      const { data: existingScales, error: checkError } = await supabase
        .from('company_risk_scales')
        .select('id, scale_type_id')
        .eq('company_id', companyId);
      
      if (checkError) {
        console.error('Error checking existing scales:', checkError);
        return false;
      }
      
      console.log(`Found ${existingScales?.length || 0} existing scales for company`);
      
      // Get all required scale types
      const requiredScaleTypes = [
        { name: 'financial_impact', description: 'Impact financier', category: 'impact' },
        { name: 'reputational_impact', description: 'Impact réputationnel', category: 'impact' },
        { name: 'individual_impact', description: 'Impact sur les individus', category: 'impact' },
        { name: 'regulatory_impact', description: 'Impact réglementaire', category: 'impact' },
        { name: 'productivity_impact', description: 'Impact sur la productivité', category: 'impact' },
        { name: 'likelihood_scale', description: 'Échelle de probabilité', category: 'likelihood' }
      ];
      
      // Get all scale types from database
      const { data: scaleTypes, error: typesError } = await supabase
        .from('risk_scale_types')
        .select('id, name, category');
      
      if (typesError) {
        console.error('Error fetching scale types:', typesError);
        return false;
      }
      
      if (!scaleTypes) {
        console.error('No scale types found');
        return false;
      }
      
      // For each required scale type, check if it exists and if the company already has it
      for (const requiredType of requiredScaleTypes) {
        // Find matching scale type in the database
        const matchingScaleType = scaleTypes.find(t => t.name === requiredType.name);
        
        if (!matchingScaleType) {
          console.log(`Scale type ${requiredType.name} does not exist in the database, creating it`);
          
          // Create the scale type if it doesn't exist
          const { data: newScaleType, error: createTypeError } = await supabase
            .from('risk_scale_types')
            .insert([requiredType])
            .select()
            .single();
          
          if (createTypeError) {
            console.error(`Error creating scale type ${requiredType.name}:`, createTypeError);
            continue;
          }
          
          // Now check if the company already has this scale type
          const hasScale = existingScales?.some(scale => scale.scale_type_id === newScaleType.id);
          
          if (!hasScale) {
            // Create company scale
            await createCompanyRiskScale(companyId, newScaleType.id, requiredType.category);
          }
        } else {
          // Scale type exists, check if company already has it
          const hasScale = existingScales?.some(scale => scale.scale_type_id === matchingScaleType.id);
          
          if (!hasScale) {
            // Create company scale
            await createCompanyRiskScale(companyId, matchingScaleType.id, requiredType.category);
          } else {
            console.log(`Company already has scale for ${requiredType.name}`);
          }
        }
      }
      
      // Check if probability scale exists
      await setupLikelihoodScale(companyId);
      
      return true;
    } catch (error) {
      console.error('Error ensuring default risk scales exist:', error);
      return false;
    }
  }, []);
  
  // Helper function to create a company risk scale
  const createCompanyRiskScale = async (companyId: string, scaleTypeId: string, category: string): Promise<boolean> => {
    try {
      console.log(`Creating company risk scale for type ${scaleTypeId}`);
      
      // Create company scale
      const { data: newScale, error: createScaleError } = await supabase
        .from('company_risk_scales')
        .insert([{
          company_id: companyId,
          scale_type_id: scaleTypeId,
          is_active: true
        }])
        .select()
        .single();
      
      if (createScaleError) {
        // Check if this is a unique constraint violation (scale already exists)
        if (createScaleError.code === '23505') {
          console.log(`Scale already exists for company ${companyId} and type ${scaleTypeId}`);
          return true;
        }
        
        console.error('Error creating company risk scale:', createScaleError);
        return false;
      }
      
      if (!newScale) {
        console.error('No scale created');
        return false;
      }
      
      // Create levels
      if (category === 'impact') {
        await createImpactLevels(newScale.id);
      } else if (category === 'likelihood') {
        await createLikelihoodLevels(newScale.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating company risk scale:', error);
      return false;
    }
  };
  
  // Helper function to create impact levels
  const createImpactLevels = async (scaleId: string): Promise<boolean> => {
    try {
      const levels = [
        { level_value: 1, name: 'Négligeable', description: 'Impact négligeable', color: '#4CAF50' },
        { level_value: 2, name: 'Faible', description: 'Impact faible', color: '#FFA726' },
        { level_value: 3, name: 'Significatif', description: 'Impact significatif', color: '#9C27B0' },
        { level_value: 4, name: 'Majeur', description: 'Impact majeur', color: '#F44336' }
      ];
      
      const levelsWithScaleId = levels.map(level => ({
        ...level,
        company_risk_scale_id: scaleId
      }));
      
      const { error: levelsError } = await supabase
        .from('risk_scale_levels')
        .insert(levelsWithScaleId);
      
      if (levelsError) {
        console.error('Error creating impact levels:', levelsError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating impact levels:', error);
      return false;
    }
  };

  // Setup likelihood scale
  const setupLikelihoodScale = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      console.log("Setting up likelihood scale for company:", companyId);
      
      // First check if a likelihood scale type already exists
      const { data: likelihoodTypes, error: typesError } = await supabase
        .from('risk_scale_types')
        .select('*')
        .eq('category', 'likelihood');
      
      if (typesError) {
        console.error('Error checking likelihood scale types:', typesError);
        return false;
      }
      
      let likelihoodType: any;
      
      if (likelihoodTypes && likelihoodTypes.length > 0) {
        likelihoodType = likelihoodTypes[0];
      } else {
        // Create a new likelihood scale type
        const { data, error } = await supabase
          .from('risk_scale_types')
          .insert([{
            name: 'likelihood_scale',
            description: 'L\'échelle de probabilité indique la fréquence de survenue d\'un risque, allant du rare au presque certain.',
            category: 'likelihood'
          }])
          .select()
          .single();
        
        if (error || !data) {
          console.error('Error creating likelihood scale type:', error);
          return false;
        }
        
        likelihoodType = data;
      }
      
      // Check if the company already has this scale
      const { data: existingScales, error: checkError } = await supabase
        .from('company_risk_scales')
        .select('id')
        .eq('company_id', companyId)
        .eq('scale_type_id', likelihoodType.id);
      
      if (checkError) {
        console.error('Error checking existing likelihood scale:', checkError);
        return false;
      }
      
      if (existingScales && existingScales.length > 0) {
        // Scale already exists, check if it has levels
        const { data: levelsData, error: levelsCheckError } = await supabase
          .from('risk_scale_levels')
          .select('id')
          .eq('company_risk_scale_id', existingScales[0].id)
          .limit(1);
        
        if (levelsCheckError) {
          console.error('Error checking likelihood scale levels:', levelsCheckError);
        } else if (!levelsData || levelsData.length === 0) {
          // Scale exists but has no levels, create them
          await createLikelihoodLevels(existingScales[0].id);
        } else {
          console.log('Likelihood scale already exists with levels for this company');
        }
        return true;
      }
      
      console.log('Creating likelihood scale for company');
      
      // Create the likelihood scale for the company
      const { data: newScale, error: createError } = await supabase
        .from('company_risk_scales')
        .insert([{
          company_id: companyId,
          scale_type_id: likelihoodType.id,
          is_active: true
        }])
        .select()
        .single();
      
      if (createError || !newScale) {
        // Check if this is a constraint violation (already exists)
        if (createError && createError.code === '23505') {
          console.log('Likelihood scale already exists for this company (constraint violation)');
          
          // Try to get the existing scale
          const { data: existingScale } = await supabase
            .from('company_risk_scales')
            .select('id')
            .eq('company_id', companyId)
            .eq('scale_type_id', likelihoodType.id)
            .single();
          
          if (existingScale) {
            // Check if it has levels
            const { data: levelsCheck } = await supabase
              .from('risk_scale_levels')
              .select('id')
              .eq('company_risk_scale_id', existingScale.id)
              .limit(1);
            
            if (!levelsCheck || levelsCheck.length === 0) {
              // Create levels
              await createLikelihoodLevels(existingScale.id);
            }
            
            return true;
          }
          
          return false;
        }
        
        console.error('Error creating likelihood scale:', createError);
        return false;
      }
      
      // Create the likelihood levels
      return await createLikelihoodLevels(newScale.id);
    } catch (error) {
      console.error('Error setting up likelihood scale:', error);
      return false;
    }
  }, []);
  
  // Helper function to create likelihood levels
  const createLikelihoodLevels = async (scaleId: string): Promise<boolean> => {
    try {
      const levels = [
        { 
          name: 'Peu probable', 
          description: 'L\'évènement n\'a que très peu de chances moyennes de se produire sur la période (1 fois tous les 10 ans)', 
          color: '#4CAF50', 
          level_value: 1 
        },
        { 
          name: 'Relativement probable', 
          description: 'L\'évènement a des chances moyennes de se produire sur la période (1 fois tous les 5 ans)', 
          color: '#FFA726', 
          level_value: 2 
        },
        { 
          name: 'Hautement probable', 
          description: 'L\'évènement a de très grandes chances de se produire sur la période (1 fois tous les 2 ans)', 
          color: '#9C27B0', 
          level_value: 3 
        },
        { 
          name: 'Certain', 
          description: 'L\'évènement a de très grandes chances de se produire sur la période (1 fois par an)', 
          color: '#F44336', 
          level_value: 4 
        }
      ];
      
      const levelsToInsert = levels.map(level => ({
        company_risk_scale_id: scaleId,
        name: level.name,
        description: level.description,
        color: level.color,
        level_value: level.level_value
      }));
      
      const { error: levelsError } = await supabase
        .from('risk_scale_levels')
        .insert(levelsToInsert);
      
      if (levelsError) {
        console.error('Error creating likelihood scale levels:', levelsError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating likelihood levels:', error);
      return false;
    }
  };

  return {
    ensureDefaultScalesExist,
    setupLikelihoodScale
  };
};
