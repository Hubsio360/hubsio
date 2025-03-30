
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures that all required impact scales exist for a company
 * @param companyId The ID of the company to check scales for
 * @returns Promise<boolean> indicating success or failure
 */
export const ensureImpactScalesExist = async (companyId: string): Promise<boolean> => {
  try {
    console.log("Vérification des échelles d'impact pour le client:", companyId);
    
    // Fetch all impact scale types
    const { data: scaleTypes, error: typesError } = await supabase
      .from('risk_scale_types')
      .select('*')
      .eq('category', 'impact');
    
    if (typesError) {
      console.error("Erreur lors de la récupération des types d'échelle:", typesError);
      return false;
    }
    
    // Check which scales already exist for the company
    const { data: existingScales, error: scalesError } = await supabase
      .from('company_risk_scales')
      .select('*, scale_type_id')
      .eq('company_id', companyId);
      
    if (scalesError) {
      console.error("Erreur lors de la récupération des échelles existantes:", scalesError);
      return false;
    }
    
    const existingTypeIds = existingScales?.map(scale => scale.scale_type_id) || [];
    
    // Create missing scales
    const createPromises = scaleTypes
      ?.filter(type => !existingTypeIds.includes(type.id))
      ?.map(async (type) => {
        console.log(`Création de l'échelle d'impact ${type.name} pour le client ${companyId}`);
        
        // First create the scale
        const { data: newScale, error: createError } = await supabase
          .from('company_risk_scales')
          .insert({
            company_id: companyId,
            scale_type_id: type.id,
            is_active: true
          })
          .select()
          .single();
        
        if (createError) {
          console.error(`Erreur lors de la création de l'échelle ${type.name}:`, createError);
          return false;
        }
        
        // Then create the default levels for this scale
        const levelData = [
          { company_risk_scale_id: newScale.id, level_value: 1, name: 'Négligeable', description: 'Impact négligeable', color: '#4CAF50' },
          { company_risk_scale_id: newScale.id, level_value: 2, name: 'Faible', description: 'Impact faible', color: '#FFA726' },
          { company_risk_scale_id: newScale.id, level_value: 3, name: 'Significatif', description: 'Impact significatif', color: '#9C27B0' },
          { company_risk_scale_id: newScale.id, level_value: 4, name: 'Majeur', description: 'Impact majeur', color: '#F44336' }
        ];
        
        const { error: levelsError } = await supabase
          .from('risk_scale_levels')
          .insert(levelData);
        
        if (levelsError) {
          console.error(`Erreur lors de la création des niveaux pour l'échelle ${type.name}:`, levelsError);
          return false;
        }
        
        return true;
      }) || [];
    
    if (createPromises.length === 0) {
      console.log("Toutes les échelles d'impact existent déjà");
      return true;
    }
    
    const results = await Promise.all(createPromises);
    return results.every(Boolean);
    
  } catch (err) {
    console.error("Erreur lors de la création des échelles d'impact:", err);
    return false;
  }
};

/**
 * Ensures that all required risk scales exist for a company
 * @param companyId The ID of the company to check scales for
 * @returns Promise<boolean> indicating success or failure
 */
export const ensureCompanyHasRequiredScales = async (companyId: string): Promise<boolean> => {
  try {
    console.log("Vérification des échelles requises pour le client:", companyId);
    
    // Ensure both types of scales exist
    const impactResult = await ensureImpactScalesExist(companyId);
    
    // Here we could add more scale creation logic if needed
    
    return impactResult;
  } catch (err) {
    console.error("Erreur lors de la création des échelles requises:", err);
    return false;
  }
};
