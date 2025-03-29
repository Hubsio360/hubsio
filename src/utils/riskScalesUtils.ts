
import { supabase } from '@/integrations/supabase/client';
import { RiskScaleType, RiskScaleLevel } from '@/types';

/**
 * Creates risk scales for a company from the templates
 */
export const createRiskScalesFromTemplates = async (companyId: string): Promise<boolean> => {
  try {
    console.log("Creating risk scales from templates for company:", companyId);
    
    // Get all templates
    const { data: templates, error: templatesError } = await supabase
      .from('risk_scales_template')
      .select('*');
    
    if (templatesError) {
      console.error("Error fetching scale templates:", templatesError);
      return false;
    }
    
    if (!templates || templates.length === 0) {
      console.error("No scale templates found");
      return false;
    }
    
    // Check if company already has risk scales
    const { data: existingScales, error: checkError } = await supabase
      .from('company_risk_scales')
      .select('id, scale_type_id')
      .eq('company_id', companyId);
    
    if (checkError) {
      console.error("Error checking existing scales:", checkError);
      return false;
    }
    
    // Create a map of existing scale type IDs to avoid duplicates
    const existingScaleTypeIds = new Set(
      existingScales?.map(scale => scale.scale_type_id) || []
    );
    
    // Process each template
    for (const template of templates) {
      // Check if this scale type already exists for the company
      const { data: existingTypes, error: typesError } = await supabase
        .from('risk_scale_types')
        .select('id')
        .eq('name', template.name)
        .eq('category', template.category);
      
      if (typesError) {
        console.error(`Error checking if scale type ${template.name} exists:`, typesError);
        continue;
      }
      
      let scaleTypeId;
      
      // Create or use existing scale type
      if (!existingTypes || existingTypes.length === 0) {
        // Create scale type
        const { data: newType, error: createTypeError } = await supabase
          .from('risk_scale_types')
          .insert({
            name: template.name,
            description: template.description,
            category: template.category
          })
          .select()
          .single();
        
        if (createTypeError) {
          console.error(`Error creating scale type ${template.name}:`, createTypeError);
          continue;
        }
        
        scaleTypeId = newType.id;
      } else {
        scaleTypeId = existingTypes[0].id;
        
        // Skip if this company already has a scale of this type
        if (existingScaleTypeIds.has(scaleTypeId)) {
          console.log(`Company already has scale type ${template.name}, skipping`);
          continue;
        }
      }
      
      // Create company risk scale
      const { data: companyScale, error: scaleError } = await supabase
        .from('company_risk_scales')
        .insert({
          company_id: companyId,
          scale_type_id: scaleTypeId,
          is_active: true
        })
        .select()
        .single();
      
      if (scaleError) {
        console.error(`Error creating company scale for ${template.name}:`, scaleError);
        continue;
      }
      
      // Get template levels
      const { data: templateLevels, error: levelsError } = await supabase
        .from('risk_scale_level_templates')
        .select('*')
        .eq('risk_scale_template_id', template.id);
      
      if (levelsError || !templateLevels) {
        console.error(`Error fetching levels for template ${template.name}:`, levelsError);
        continue;
      }
      
      // Create levels for the company scale
      if (templateLevels.length > 0) {
        const levelsToInsert = templateLevels.map(level => ({
          company_risk_scale_id: companyScale.id,
          name: level.name,
          description: level.description,
          level_value: level.level_value,
          color: level.color
        }));
        
        const { error: insertLevelsError } = await supabase
          .from('risk_scale_levels')
          .insert(levelsToInsert);
        
        if (insertLevelsError) {
          console.error(`Error creating levels for scale ${template.name}:`, insertLevelsError);
          continue;
        }
      }
      
      console.log(`Successfully created scale ${template.name} for company ${companyId}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in createRiskScalesFromTemplates:", error);
    return false;
  }
};

/**
 * Checks if a company has the required risk scales, and creates them if not
 */
export const ensureCompanyHasRequiredScales = async (companyId: string): Promise<boolean> => {
  try {
    // Check if company has at least one likelihood scale and the 5 impact scales
    const { data: existingScales, error: checkError } = await supabase
      .from('company_risk_scales')
      .select(`
        id,
        scale_type: scale_type_id (
          id,
          name,
          category
        )
      `)
      .eq('company_id', companyId);
    
    if (checkError) {
      console.error("Error checking existing scales:", checkError);
      return false;
    }
    
    // Check if required scales exist
    const hasLikelihoodScale = existingScales?.some(scale => 
      scale.scale_type?.category === 'likelihood'
    );
    
    const requiredImpactTypes = [
      'financial_impact',
      'regulatory_impact', 
      'individual_impact', 
      'reputational_impact', 
      'productivity_impact'
    ];
    
    const missingImpactTypes = requiredImpactTypes.filter(requiredType => 
      !existingScales?.some(scale => scale.scale_type?.name === requiredType)
    );
    
    // If all required scales exist, we're done
    if (hasLikelihoodScale && missingImpactTypes.length === 0) {
      console.log("Company already has all required scales");
      return true;
    }
    
    // Create missing scales from templates
    console.log("Company is missing some required scales, creating from templates");
    return await createRiskScalesFromTemplates(companyId);
  } catch (error) {
    console.error("Error in ensureCompanyHasRequiredScales:", error);
    return false;
  }
};
