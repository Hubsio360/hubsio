
import { supabase } from '@/integrations/supabase/client';

// Function to initialize risk scale templates
export const initializeRiskScaleTemplates = async (): Promise<boolean> => {
  try {
    // Check if templates already exist
    const { data: existingTemplates, error: checkError } = await supabase
      .from('risk_scales_template')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing templates:", checkError);
      return false;
    }
    
    // Skip if templates already exist
    if (existingTemplates && existingTemplates.length > 0) {
      console.log("Risk scale templates already exist");
      return true;
    }
    
    console.log("Initializing risk scale templates");
    
    // Create likelihood template
    const { data: likelihoodTemplate, error: likelihoodError } = await supabase
      .from('risk_scales_template')
      .insert({
        name: 'likelihood',
        category: 'likelihood',
        description: 'Échelle de probabilité'
      })
      .select()
      .single();
    
    if (likelihoodError) {
      console.error("Error creating likelihood template:", likelihoodError);
      return false;
    }
    
    // Create likelihood levels
    const { error: likelihoodLevelsError } = await supabase
      .from('risk_scale_level_templates')
      .insert([
        {
          risk_scale_template_id: likelihoodTemplate.id,
          name: 'Faible',
          description: 'Peu probable, occurrence rare (moins d\'une fois tous les 5 ans)',
          level_value: 1,
          color: '#4CAF50'
        },
        {
          risk_scale_template_id: likelihoodTemplate.id,
          name: 'Moyenne',
          description: 'Possible, peut se produire occasionnellement (tous les 1-5 ans)',
          level_value: 2,
          color: '#FFA726'
        },
        {
          risk_scale_template_id: likelihoodTemplate.id,
          name: 'Élevée',
          description: 'Probable, se produit fréquemment (plusieurs fois par an)',
          level_value: 3,
          color: '#9C27B0'
        },
        {
          risk_scale_template_id: likelihoodTemplate.id,
          name: 'Critique',
          description: 'Quasi certain, se produit régulièrement (mensuel ou plus)',
          level_value: 4,
          color: '#F44336'
        }
      ]);
    
    if (likelihoodLevelsError) {
      console.error("Error creating likelihood level templates:", likelihoodLevelsError);
      return false;
    }
    
    // Create impact templates
    const impactTemplates = [
      {
        name: 'financial_impact',
        category: 'impact',
        description: 'Impact financier'
      },
      {
        name: 'regulatory_impact',
        category: 'impact',
        description: 'Impact réglementaire'
      },
      {
        name: 'individual_impact',
        category: 'impact',
        description: 'Impact sur les individus'
      },
      {
        name: 'reputational_impact',
        category: 'impact',
        description: 'Impact réputationnel'
      },
      {
        name: 'productivity_impact',
        category: 'impact',
        description: 'Impact sur la productivité'
      }
    ];
    
    for (const template of impactTemplates) {
      const { data: impactTemplate, error: impactError } = await supabase
        .from('risk_scales_template')
        .insert(template)
        .select()
        .single();
      
      if (impactError) {
        console.error(`Error creating ${template.name} template:`, impactError);
        continue;
      }
      
      // Create impact levels
      const { error: impactLevelsError } = await supabase
        .from('risk_scale_level_templates')
        .insert([
          {
            risk_scale_template_id: impactTemplate.id,
            name: 'Négligeable',
            description: 'Impact négligeable sans conséquence',
            level_value: 1,
            color: '#4CAF50'
          },
          {
            risk_scale_template_id: impactTemplate.id,
            name: 'Faible',
            description: 'Impact faible avec conséquence limitée',
            level_value: 2,
            color: '#FFA726'
          },
          {
            risk_scale_template_id: impactTemplate.id,
            name: 'Significatif',
            description: 'Impact significatif avec conséquences notables',
            level_value: 3,
            color: '#9C27B0'
          },
          {
            risk_scale_template_id: impactTemplate.id,
            name: 'Majeur',
            description: 'Impact majeur avec conséquences graves',
            level_value: 4,
            color: '#F44336'
          }
        ]);
      
      if (impactLevelsError) {
        console.error(`Error creating ${template.name} level templates:`, impactLevelsError);
      }
    }
    
    // Add specific descriptions for financial impact
    const { data: financialTemplate, error: financialFetchError } = await supabase
      .from('risk_scales_template')
      .select('id')
      .eq('name', 'financial_impact')
      .single();
    
    if (!financialFetchError && financialTemplate) {
      const { error: updateFinancialLevelsError } = await supabase
        .from('risk_scale_level_templates')
        .update({ description: 'Impact financier négligeable sans conséquence sur la santé financière de l\'entreprise (moins de 5K€)' })
        .eq('risk_scale_template_id', financialTemplate.id)
        .eq('level_value', 1);
      
      const { error: updateFinancialLevels2Error } = await supabase
        .from('risk_scale_level_templates')
        .update({ description: 'Impact financier faible avec conséquence négligeable sur la santé financière de l\'entreprise (Jusqu\'à 10 K€)' })
        .eq('risk_scale_template_id', financialTemplate.id)
        .eq('level_value', 2);
      
      const { error: updateFinancialLevels3Error } = await supabase
        .from('risk_scale_level_templates')
        .update({ description: 'Impact financier significatif pouvant avoir des conséquences sur la santé financière de l\'entreprise (Jusqu\'à 120 K€)' })
        .eq('risk_scale_template_id', financialTemplate.id)
        .eq('level_value', 3);
      
      const { error: updateFinancialLevels4Error } = await supabase
        .from('risk_scale_level_templates')
        .update({ description: 'Impact financier majeur pouvant avoir des conséquences graves sur la santé financière de l\'entreprise (au delà de 120 K€)' })
        .eq('risk_scale_template_id', financialTemplate.id)
        .eq('level_value', 4);
    }
    
    console.log("Successfully initialized risk scale templates");
    return true;
  } catch (error) {
    console.error("Error initializing risk scale templates:", error);
    return false;
  }
};
