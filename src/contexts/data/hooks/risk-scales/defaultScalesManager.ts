
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
        .select('id')
        .eq('company_id', companyId);
      
      if (checkError) {
        console.error('Error checking existing scales:', checkError);
        return false;
      }
      
      console.log(`Found ${existingScales?.length || 0} existing scales for company`);
      
      // Create default scales even if some already exist - will ensure all required types are present
      // Appeler la fonction Supabase pour créer les échelles par défaut
      const { error: createError } = await supabase
        .rpc('create_default_company_risk_scales', { company_id: companyId });
      
      if (createError) {
        console.error('Error creating default risk scales via RPC:', createError);
        
        // Fallback: create manually if RPC fails
        const success = await createDefaultScalesManually(companyId);
        if (!success) {
          return false;
        }
      }
      
      // Vérifier si l'échelle de probabilité existe, sinon la créer
      await setupLikelihoodScale(companyId);
      
      return true;
    } catch (error) {
      console.error('Error ensuring default risk scales exist:', error);
      return false;
    }
  }, []);
  
  // Fallback function to create scales manually if RPC fails
  const createDefaultScalesManually = async (companyId: string): Promise<boolean> => {
    try {
      console.log("Creating default scales manually for company:", companyId);
      
      // Vérifier si les types d'échelles nécessaires existent
      const requiredScaleTypes = [
        { name: 'financial_impact', description: 'Impact financier', category: 'impact' },
        { name: 'reputational_impact', description: 'Impact réputationnel', category: 'impact' },
        { name: 'individual_impact', description: 'Impact sur les individus', category: 'impact' },
        { name: 'regulatory_impact', description: 'Impact réglementaire', category: 'impact' },
        { name: 'productivity_impact', description: 'Impact sur la productivité', category: 'impact' },
        { name: 'likelihood_scale', description: 'Échelle de probabilité', category: 'likelihood' }
      ];
      
      // Récupérer les types d'échelles existants
      const { data: existingTypes, error: typesError } = await supabase
        .from('risk_scale_types')
        .select('id, name, category');
      
      if (typesError) {
        console.error('Error checking existing scale types:', typesError);
        return false;
      }
      
      // Créer les types d'échelles manquants
      for (const requiredType of requiredScaleTypes) {
        if (!existingTypes) continue;
        
        const typeExists = existingTypes.some(t => t.name === requiredType.name);
        if (!typeExists) {
          console.log(`Creating missing scale type: ${requiredType.name}`);
          await supabase
            .from('risk_scale_types')
            .insert([{
              name: requiredType.name,
              description: requiredType.description,
              category: requiredType.category
            }]);
        }
      }
      
      // Récupérer tous les types d'échelles après avoir créé les manquants
      const { data: allTypes, error: allTypesError } = await supabase
        .from('risk_scale_types')
        .select('id, name, category');
      
      if (allTypesError || !allTypes) {
        console.error('Error fetching all scale types:', allTypesError);
        return false;
      }
      
      // Pour chaque type d'échelle, vérifier si l'entreprise a déjà cette échelle
      for (const scaleType of allTypes) {
        const { data: existingCompanyScales, error: checkError } = await supabase
          .from('company_risk_scales')
          .select('id')
          .eq('company_id', companyId)
          .eq('scale_type_id', scaleType.id);
        
        if (checkError) {
          console.error(`Error checking if company has scale type ${scaleType.name}:`, checkError);
          continue;
        }
        
        // Si l'entreprise n'a pas cette échelle, la créer
        if (!existingCompanyScales || existingCompanyScales.length === 0) {
          console.log(`Creating scale for company: ${scaleType.name}`);
          
          const { data: newScale, error: createError } = await supabase
            .from('company_risk_scales')
            .insert([{
              company_id: companyId,
              scale_type_id: scaleType.id,
              is_active: true
            }])
            .select()
            .single();
          
          if (createError || !newScale) {
            console.error(`Error creating scale for ${scaleType.name}:`, createError);
            continue;
          }
          
          // Créer les niveaux pour cette échelle
          let levels = [];
          
          if (scaleType.category === 'impact') {
            levels = [
              { level_value: 1, name: 'Négligeable', description: 'Impact négligeable', color: '#4CAF50' },
              { level_value: 2, name: 'Faible', description: 'Impact faible', color: '#FFA726' },
              { level_value: 3, name: 'Significatif', description: 'Impact significatif', color: '#9C27B0' },
              { level_value: 4, name: 'Majeur', description: 'Impact majeur', color: '#F44336' }
            ];
          } else if (scaleType.category === 'likelihood') {
            levels = [
              { level_value: 1, name: 'Peu probable', description: 'Événement peu probable', color: '#4CAF50' },
              { level_value: 2, name: 'Relativement probable', description: 'Événement relativement probable', color: '#FFA726' },
              { level_value: 3, name: 'Hautement probable', description: 'Événement hautement probable', color: '#9C27B0' },
              { level_value: 4, name: 'Certain', description: 'Événement certain', color: '#F44336' }
            ];
          }
          
          // Ajouter les niveaux à l'échelle
          const levelsWithScaleId = levels.map(level => ({
            ...level,
            company_risk_scale_id: newScale.id
          }));
          
          const { error: levelsError } = await supabase
            .from('risk_scale_levels')
            .insert(levelsWithScaleId);
          
          if (levelsError) {
            console.error(`Error creating levels for ${scaleType.name}:`, levelsError);
          }
        } else {
          console.log(`Company already has scale type: ${scaleType.name}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in manual creation of default scales:', error);
      return false;
    }
  };

  // Setup likelihood scale
  const setupLikelihoodScale = useCallback(async (companyId: string): Promise<boolean> => {
    try {
      console.log("Setting up likelihood scale for company:", companyId);
      
      // First check if a likelihood scale type already exists
      let likelihoodType: any;
      
      const { data: existingTypes, error: typesError } = await supabase
        .from('risk_scale_types')
        .select('*')
        .eq('category', 'likelihood');
      
      if (typesError) {
        console.error('Error checking likelihood scale types:', typesError);
        return false;
      }
      
      if (existingTypes && existingTypes.length > 0) {
        likelihoodType = {
          ...existingTypes[0],
          category: 'likelihood'
        };
      } else {
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
        
        if (error || !data) {
          console.error('Error creating likelihood scale type:', error);
          return false;
        }
        
        likelihoodType = {
          ...data,
          category: 'likelihood'
        };
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
