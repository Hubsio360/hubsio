
import { supabase } from '@/integrations/supabase/client';

/**
 * Crée les échelles de risque par défaut pour une entreprise donnée
 */
export const ensureCompanyHasRequiredScales = async (companyId: string): Promise<boolean> => {
  if (!companyId) return false;

  try {
    console.log("Vérification des échelles de risque requises pour:", companyId);
    
    // Appel à la fonction côté base de données pour créer les échelles par défaut
    const { data, error } = await supabase.rpc('create_default_company_risk_scales', {
      company_id: companyId
    });

    if (error) {
      console.error("Erreur lors de la création des échelles de risque:", error);
      return false;
    }

    console.log("Échelles de risque créées avec succès:", data);
    return true;
  } catch (err) {
    console.error("Exception lors de la création des échelles de risque:", err);
    return false;
  }
};

/**
 * Vérifie si une entreprise a l'échelle de probabilité configurée
 */
export const setupLikelihoodScale = async (companyId: string): Promise<boolean> => {
  if (!companyId) return false;

  try {
    // Recherche du type d'échelle 'likelihood'
    const { data: scaleTypes, error: typesError } = await supabase
      .from('risk_scale_types')
      .select('*')
      .eq('category', 'likelihood')
      .single();

    if (typesError || !scaleTypes) {
      console.error("Échelle de type 'likelihood' non trouvée:", typesError);
      return false;
    }

    // Vérification si l'entreprise a déjà cette échelle
    const { data: existingScale, error: scaleError } = await supabase
      .from('company_risk_scales')
      .select('*')
      .eq('company_id', companyId)
      .eq('scale_type_id', scaleTypes.id)
      .maybeSingle();

    if (scaleError) {
      console.error("Erreur lors de la vérification de l'échelle de probabilité:", scaleError);
      return false;
    }

    // Si l'échelle existe déjà, on ne fait rien
    if (existingScale) {
      console.log("L'échelle de probabilité existe déjà pour cette entreprise");
      return true;
    }

    // Création de l'échelle de probabilité
    const { data: newScale, error: createError } = await supabase
      .from('company_risk_scales')
      .insert({
        company_id: companyId,
        scale_type_id: scaleTypes.id,
        is_active: true
      })
      .select()
      .single();

    if (createError || !newScale) {
      console.error("Erreur lors de la création de l'échelle de probabilité:", createError);
      return false;
    }

    // Création des niveaux pour l'échelle de probabilité
    const levels = [
      {
        company_risk_scale_id: newScale.id,
        level_value: 1,
        name: 'Faible',
        description: 'Probabilité d\'occurrence faible (1 fois tous les 3 ans ou moins)',
        color: '#4CAF50'
      },
      {
        company_risk_scale_id: newScale.id,
        level_value: 2,
        name: 'Moyen',
        description: 'Probabilité d\'occurrence moyenne (1 fois par an)',
        color: '#FFA726'
      },
      {
        company_risk_scale_id: newScale.id,
        level_value: 3,
        name: 'Élevé',
        description: 'Probabilité d\'occurrence élevée (plusieurs fois par an)',
        color: '#9C27B0'
      },
      {
        company_risk_scale_id: newScale.id,
        level_value: 4,
        name: 'Critique',
        description: 'Probabilité d\'occurrence très élevée (mensuel ou plus)',
        color: '#F44336'
      }
    ];

    const { error: levelsError } = await supabase
      .from('risk_scale_levels')
      .insert(levels);

    if (levelsError) {
      console.error("Erreur lors de la création des niveaux de probabilité:", levelsError);
      return false;
    }

    console.log("Échelle de probabilité créée avec succès");
    return true;
  } catch (err) {
    console.error("Exception lors de la création de l'échelle de probabilité:", err);
    return false;
  }
};

/**
 * Cette fonction vérifie si toutes les échelles d'impact requises existent
 * et crée celles qui sont manquantes
 */
export const ensureImpactScalesExist = async (companyId: string): Promise<boolean> => {
  if (!companyId) return false;

  try {
    // Récupération des types d'échelles d'impact requis
    const { data: impactTypes, error: typesError } = await supabase
      .from('risk_scale_types')
      .select('*')
      .eq('category', 'impact');

    if (typesError || !impactTypes) {
      console.error("Erreur lors de la récupération des types d'échelles d'impact:", typesError);
      return false;
    }

    // Récupération des échelles d'impact existantes pour l'entreprise
    const { data: existingScales, error: scalesError } = await supabase
      .from('company_risk_scales')
      .select('*, risk_scale_types!inner(*)')
      .eq('company_id', companyId)
      .eq('risk_scale_types.category', 'impact');

    if (scalesError) {
      console.error("Erreur lors de la récupération des échelles d'impact existantes:", scalesError);
      return false;
    }

    // Création des échelles manquantes
    const existingTypeIds = existingScales?.map(scale => scale.scale_type_id) || [];
    const missingTypes = impactTypes.filter(type => !existingTypeIds.includes(type.id));

    if (missingTypes.length === 0) {
      console.log("Toutes les échelles d'impact requises existent déjà");
      return true;
    }

    // Création des échelles manquantes
    for (const type of missingTypes) {
      const { data: newScale, error: createError } = await supabase
        .from('company_risk_scales')
        .insert({
          company_id: companyId,
          scale_type_id: type.id,
          is_active: true
        })
        .select()
        .single();

      if (createError || !newScale) {
        console.error(`Erreur lors de la création de l'échelle d'impact "${type.name}":`, createError);
        continue;
      }

      // Création des niveaux pour cette échelle
      const levels = [
        {
          company_risk_scale_id: newScale.id,
          level_value: 1,
          name: 'Faible',
          description: `Impact ${type.name} faible`,
          color: '#4CAF50'
        },
        {
          company_risk_scale_id: newScale.id,
          level_value: 2,
          name: 'Moyen',
          description: `Impact ${type.name} moyen`,
          color: '#FFA726'
        },
        {
          company_risk_scale_id: newScale.id,
          level_value: 3,
          name: 'Élevé',
          description: `Impact ${type.name} élevé`,
          color: '#9C27B0'
        },
        {
          company_risk_scale_id: newScale.id,
          level_value: 4,
          name: 'Critique',
          description: `Impact ${type.name} critique`,
          color: '#F44336'
        }
      ];

      const { error: levelsError } = await supabase
        .from('risk_scale_levels')
        .insert(levels);

      if (levelsError) {
        console.error(`Erreur lors de la création des niveaux pour l'échelle "${type.name}":`, levelsError);
      }
    }

    console.log(`${missingTypes.length} échelles d'impact créées avec succès`);
    return true;
  } catch (err) {
    console.error("Exception lors de la création des échelles d'impact:", err);
    return false;
  }
};
