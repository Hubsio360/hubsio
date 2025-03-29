
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    console.log(`Processing AI request with action: ${action}`);

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }

    // Traiter différentes actions selon les besoins
    switch (action) {
      case 'getCompanyInfo':
        return await getCompanyInfo(data.companyName);
      case 'generateRiskScenarios':
        return await generateRiskScenarios(data.companyName, data.businessProcesses);
      case 'generateAdditionalScenarios': 
        return await generateAdditionalScenarios(data.existingScenarios);
      default:
        throw new Error(`Action non reconnue: ${action}`);
    }
  } catch (error) {
    console.error('Error in ai-risk-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fonction pour obtenir des informations sur une entreprise à l'aide d'OpenAI
async function getCompanyInfo(companyName: string) {
  console.log(`Fetching information for company: ${companyName}`);

  const prompt = `
    Agis comme un analyste de risques expérimenté disposant d'une vaste connaissance des entreprises et des processus métiers. 
    
    Ta mission est de rechercher et d'analyser en détail l'entreprise "${companyName}". Fais des recherches approfondies en te basant sur tes connaissances et en imaginant que tu as effectué des recherches en ligne pour cette entreprise spécifique.
    
    Un processus métier est un ensemble d'activités coordonnées qui permettent à une entreprise de créer de la valeur pour ses clients. 
    C'est une séquence d'étapes ou d'opérations qui contribuent à la réalisation des objectifs commerciaux de l'entreprise. 
    Exemples de processus métier: gestion des commandes clients, recrutement de personnel, développement de nouveaux produits, etc.
    
    1. Fournis une description détaillée de l'entreprise (secteur d'activité, taille, positionnement sur le marché, historique si pertinent)
    
    2. Identifie au moins 15 processus métier clés de cette entreprise qui sont essentiels à son fonctionnement
       • Chaque processus doit être clairement identifiable et isolé
       • Formule le nom de chaque processus de manière concise (2-5 mots)
       • Utilise des verbes d'action (gestion, traitement, développement, etc.)
       • Couvre tous les aspects de l'entreprise: opérations, finance, marketing, RH, IT, etc.
       • Sois très spécifique au secteur d'activité de l'entreprise
    
    Réponds au format JSON strict avec deux champs seulement:
    {"description": "description détaillée de l'entreprise en 3-4 phrases", "activities": ["Processus 1", "Processus 2", ...]}
    
    IMPORTANT: Le champ "activities" doit être un tableau (array) de chaînes de caractères, PAS une chaîne de texte formatée.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un assistant spécialisé dans l\'analyse de risques et la cybersécurité avec une vaste connaissance des entreprises et de leurs processus métier.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    console.log('OpenAI response received successfully');
    
    // Extraire et formater la réponse
    const content = responseData.choices[0].message.content;
    
    // Tenter de parser la réponse en JSON
    try {
      // Essayer d'abord de parser directement le contenu
      const result = JSON.parse(content);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      // Si le parsing direct échoue, essayer de nettoyer le contenu
      console.warn('Could not parse OpenAI response as JSON directly, trying to clean the content:', parseError);
      
      try {
        // Rechercher un objet JSON valide dans la chaîne de caractères
        const jsonMatch = content.match(/(\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[0]) {
          const jsonContent = jsonMatch[0];
          const result = JSON.parse(jsonContent);
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (cleaningError) {
        console.warn('Failed to extract JSON from content after cleaning:', cleaningError);
      }
      
      // Extraction manuelle basée sur le texte si tout échoue
      console.warn('Falling back to manual text extraction');
      
      let description = '';
      let activities: string[] = [];
      
      // Extraction simple basée sur le texte
      if (content.includes('description') || content.includes('Description')) {
        description = content.split(/description.*?:/i)[1]?.split(/activities|processus/i)[0].trim() || '';
      }
      
      if (content.includes('activités') || content.includes('processus') || content.includes('Activities')) {
        const activitiesText = content.split(/activités.*?:|processus.*?:|activities.*?:/i)[1]?.trim() || '';
        activities = activitiesText.split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().substring(1).trim());
      }
      
      return new Response(
        JSON.stringify({ description, activities }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error getting company info from OpenAI:', error);
    throw error;
  }
}

// Fonction pour générer des scénarios de risque en fonction des processus métier
async function generateRiskScenarios(companyName: string, businessProcesses: string[]) {
  console.log(`Generating risk scenarios for ${companyName} with processes:`, businessProcesses);

  const processesText = businessProcesses.map(p => `- ${p}`).join('\n');
  
  const prompt = `
    En tant qu'expert en analyse de risques pour l'entreprise "${companyName}", génère au moins 15 scénarios de risque pertinents 
    pour les processus métier suivants:
    
    ${processesText}
    
    Pour chaque scénario:
    1. Donne un titre court et descriptif en français (5-10 mots maximum)
    2. Fournis une description détaillée en français qui explique la nature du risque, ses causes potentielles et ses impacts (3-5 phrases)
    3. Assure-toi que les scénarios couvrent un large éventail de risques: technologiques, opérationnels, humains, liés à la sécurité de l'information, etc.
    4. Chaque scénario doit être réaliste et spécifique au contexte de l'entreprise et de ses processus métier
    5. Évite les doublons et les descriptions trop génériques
    6. TRÈS IMPORTANT: Tous les titres et descriptions doivent être UNIQUEMENT en français
    
    Réponds au format JSON strict avec une liste d'objets, chacun ayant:
    - "id": un identifiant unique (format "scenario-X" où X est un nombre)
    - "name": le titre court du scénario en français
    - "description": la description détaillée en français
    - "selected": true (tous les scénarios seront présélectionnés)
    
    IMPORTANT: Ta réponse doit être un tableau JSON valide et rien d'autre. Utilise UNIQUEMENT le français pour tous les contenus.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en analyse de risques de cybersécurité qui aide à identifier les scénarios de risque pertinents. Tu réponds UNIQUEMENT en français et en JSON valide sans aucun texte supplémentaire.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    console.log('OpenAI risk scenarios received successfully');
    
    // Extraire et formater la réponse
    const content = responseData.choices[0].message.content;
    
    // Tenter de parser la réponse en JSON
    try {
      // Essayer d'abord de parser directement le contenu
      const parsedContent = JSON.parse(content);
      // S'assurer que nous avons un tableau de scénarios
      const scenarios = parsedContent.scenarios || parsedContent;
      
      // Vérifier si scenarios est bien un tableau
      if (Array.isArray(scenarios)) {
        return new Response(
          JSON.stringify(scenarios),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Si c'est un objet mais pas un tableau, chercher un tableau dedans
        for (const key in parsedContent) {
          if (Array.isArray(parsedContent[key])) {
            return new Response(
              JSON.stringify(parsedContent[key]),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        throw new Error('Le format de réponse n\'est pas un tableau de scénarios');
      }
    } catch (parseError) {
      // Si le parsing direct échoue, essayer de nettoyer le contenu
      console.warn('Could not parse OpenAI response as JSON directly, trying to clean the content:', parseError);
      
      try {
        // Rechercher un tableau JSON valide dans la chaîne de caractères
        const jsonMatch = content.match(/(\[[\s\S]*\])/);
        if (jsonMatch && jsonMatch[0]) {
          const jsonContent = jsonMatch[0];
          const scenarios = JSON.parse(jsonContent);
          return new Response(
            JSON.stringify(scenarios),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (cleaningError) {
        console.warn('Failed to extract JSON from content after cleaning:', cleaningError);
      }
      
      throw new Error('Le format de réponse d\'OpenAI n\'est pas valide. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Error generating risk scenarios from OpenAI:', error);
    throw error;
  }
}

// Nouvelle fonction pour générer des scénarios de risque additionnels
async function generateAdditionalScenarios(existingScenarios: string[]) {
  console.log(`Generating additional risk scenarios to complement existing ones:`, existingScenarios);

  const existingNamesText = existingScenarios.map(s => `- ${s}`).join('\n');
  
  const prompt = `
    En tant qu'expert en analyse de risques, génère au moins 5 scénarios de risque ADDITIONNELS et DIFFÉRENTS 
    des scénarios existants listés ci-dessous:
    
    ${existingNamesText}
    
    Pour chaque nouveau scénario:
    1. Donne un titre court et descriptif en français (5-10 mots maximum)
    2. Fournis une description détaillée en français qui explique la nature du risque, ses causes potentielles et ses impacts (3-5 phrases)
    3. Assure-toi que les scénarios couvrent un large éventail de risques: technologiques, opérationnels, humains, liés à la sécurité de l'information, etc.
    4. Chaque scénario doit être réaliste et spécifique au contexte de l'entreprise
    5. Évite absolument toute ressemblance avec les scénarios existants
    6. TRÈS IMPORTANT: Tous les titres et descriptions doivent être UNIQUEMENT en français
    
    Réponds au format JSON strict avec une liste d'objets, chacun ayant:
    - "id": un identifiant unique (format "scenario-X" où X est un nombre)
    - "name": le titre court du scénario en français
    - "description": la description détaillée en français
    - "selected": false (les nouveaux scénarios ne sont pas présélectionnés)
    
    IMPORTANT: Ta réponse doit être un tableau JSON valide et rien d'autre. Utilise UNIQUEMENT le français pour tous les contenus.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en analyse de risques de cybersécurité qui aide à identifier les scénarios de risque pertinents. Tu réponds UNIQUEMENT en français et en JSON valide sans aucun texte supplémentaire.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    console.log('OpenAI additional risk scenarios received successfully');
    
    // Extraire et formater la réponse
    const content = responseData.choices[0].message.content;
    
    // Tenter de parser la réponse en JSON
    try {
      // Essayer d'abord de parser directement le contenu
      const parsedContent = JSON.parse(content);
      // S'assurer que nous avons un tableau de scénarios
      const scenarios = parsedContent.scenarios || parsedContent;
      
      // Vérifier si scenarios est bien un tableau
      if (Array.isArray(scenarios)) {
        return new Response(
          JSON.stringify(scenarios),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Si c'est un objet mais pas un tableau, chercher un tableau dedans
        for (const key in parsedContent) {
          if (Array.isArray(parsedContent[key])) {
            return new Response(
              JSON.stringify(parsedContent[key]),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        throw new Error('Le format de réponse n\'est pas un tableau de scénarios');
      }
    } catch (parseError) {
      // Si le parsing direct échoue, essayer de nettoyer le contenu
      console.warn('Could not parse OpenAI response as JSON directly, trying to clean the content:', parseError);
      
      try {
        // Rechercher un tableau JSON valide dans la chaîne de caractères
        const jsonMatch = content.match(/(\[[\s\S]*\])/);
        if (jsonMatch && jsonMatch[0]) {
          const jsonContent = jsonMatch[0];
          const scenarios = JSON.parse(jsonContent);
          return new Response(
            JSON.stringify(scenarios),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (cleaningError) {
        console.warn('Failed to extract JSON from content after cleaning:', cleaningError);
      }
      
      throw new Error('Le format de réponse d\'OpenAI n\'est pas valide. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Error generating additional risk scenarios from OpenAI:', error);
    throw error;
  }
}

