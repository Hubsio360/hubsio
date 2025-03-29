
import { supabase } from '@/integrations/supabase/client';

export const useDefaultScalesManager = () => {
  /**
   * Ensures that the default risk scales exist for a company
   */
  const ensureDefaultScalesExist = async (companyId: string): Promise<boolean> => {
    try {
      console.log("Ensuring default scales exist for company:", companyId);
      
      // Check if company already has any scales
      const { data: existingScales, error: checkError } = await supabase
        .from('company_risk_scales')
        .select('id')
        .eq('company_id', companyId);
      
      if (checkError) {
        console.error("Error checking existing scales:", checkError);
        return false;
      }
      
      // If company already has scales, don't create duplicates
      if (existingScales && existingScales.length > 0) {
        console.log(`Company ${companyId} already has ${existingScales.length} scales, skipping creation`);
        return true;
      }
      
      // Call the database function to create default scales
      const { data, error } = await supabase.rpc(
        'create_default_company_risk_scales',
        { company_id: companyId }
      );
      
      if (error) {
        console.error("Error creating default risk scales:", error);
        return false;
      }
      
      console.log("Default risk scales created successfully for company:", companyId);
      return true;
    } catch (error) {
      console.error("Error in ensureDefaultScalesExist:", error);
      return false;
    }
  };
  
  /**
   * Sets up the likelihood scale for a company
   */
  const setupLikelihoodScale = async (companyId: string): Promise<boolean> => {
    try {
      console.log("Setting up likelihood scale for company:", companyId);
      
      // Check if company already has a likelihood scale
      const { data: riskScaleTypes } = await supabase
        .from('risk_scale_types')
        .select('id')
        .eq('category', 'likelihood');
      
      if (!riskScaleTypes || riskScaleTypes.length === 0) {
        console.log("No likelihood scale type found, creating one");
        
        // Create likelihood scale type
        const { data: likelihoodType, error: typeError } = await supabase
          .from('risk_scale_types')
          .insert({
            name: 'likelihood',
            description: 'Échelle de probabilité',
            category: 'likelihood'
          })
          .select()
          .single();
        
        if (typeError) {
          console.error("Error creating likelihood scale type:", typeError);
          return false;
        }
        
        // Create company risk scale
        const { data: likelihoodScale, error: scaleError } = await supabase
          .from('company_risk_scales')
          .insert({
            company_id: companyId,
            scale_type_id: likelihoodType.id,
            is_active: true
          })
          .select()
          .single();
        
        if (scaleError) {
          console.error("Error creating company likelihood scale:", scaleError);
          return false;
        }
        
        // Create levels
        const { error: levelsError } = await supabase
          .from('risk_scale_levels')
          .insert([
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 1,
              name: 'Faible',
              description: 'Peu probable, occurrence rare (moins d\'une fois tous les 5 ans)',
              color: '#4CAF50'
            },
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 2,
              name: 'Moyenne',
              description: 'Possible, peut se produire occasionnellement (tous les 1-5 ans)',
              color: '#FFA726'
            },
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 3,
              name: 'Élevée',
              description: 'Probable, se produit fréquemment (plusieurs fois par an)',
              color: '#9C27B0'
            },
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 4,
              name: 'Critique',
              description: 'Quasi certain, se produit régulièrement (mensuel ou plus)',
              color: '#F44336'
            }
          ]);
        
        if (levelsError) {
          console.error("Error creating likelihood scale levels:", levelsError);
          return false;
        }
        
        console.log("Likelihood scale created successfully for company:", companyId);
        return true;
      } else {
        // Check if company already has this scale
        const { data: existingScales, error: checkError } = await supabase
          .from('company_risk_scales')
          .select('id')
          .eq('company_id', companyId)
          .eq('scale_type_id', riskScaleTypes[0].id);
        
        if (checkError) {
          console.error("Error checking existing likelihood scale:", checkError);
          return false;
        }
        
        // If company already has this scale, don't create duplicate
        if (existingScales && existingScales.length > 0) {
          console.log(`Company ${companyId} already has likelihood scale, skipping creation`);
          return true;
        }
        
        // Create company risk scale
        const { data: likelihoodScale, error: scaleError } = await supabase
          .from('company_risk_scales')
          .insert({
            company_id: companyId,
            scale_type_id: riskScaleTypes[0].id,
            is_active: true
          })
          .select()
          .single();
        
        if (scaleError) {
          console.error("Error creating company likelihood scale:", scaleError);
          return false;
        }
        
        // Create levels
        const { error: levelsError } = await supabase
          .from('risk_scale_levels')
          .insert([
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 1,
              name: 'Faible',
              description: 'Peu probable, occurrence rare (moins d\'une fois tous les 5 ans)',
              color: '#4CAF50'
            },
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 2,
              name: 'Moyenne',
              description: 'Possible, peut se produire occasionnellement (tous les 1-5 ans)',
              color: '#FFA726'
            },
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 3,
              name: 'Élevée',
              description: 'Probable, se produit fréquemment (plusieurs fois par an)',
              color: '#9C27B0'
            },
            {
              company_risk_scale_id: likelihoodScale.id,
              level_value: 4,
              name: 'Critique',
              description: 'Quasi certain, se produit régulièrement (mensuel ou plus)',
              color: '#F44336'
            }
          ]);
        
        if (levelsError) {
          console.error("Error creating likelihood scale levels:", levelsError);
          return false;
        }
        
        console.log("Likelihood scale created successfully for company:", companyId);
        return true;
      }
    } catch (error) {
      console.error("Error in setupLikelihoodScale:", error);
      return false;
    }
  };
  
  return {
    ensureDefaultScalesExist,
    setupLikelihoodScale
  };
};
