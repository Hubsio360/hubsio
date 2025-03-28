
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
    Agis comme un analyste de risques expérimenté. Tu dois rechercher et synthétiser des informations sur l'entreprise nommée "${companyName}".
    
    Un processus métier est un ensemble d'activités coordonnées qui permettent à une entreprise de créer de la valeur pour ses clients. 
    C'est une séquence d'étapes ou d'opérations qui contribuent à la réalisation des objectifs commerciaux de l'entreprise. 
    Exemples de processus métier: gestion des commandes clients, recrutement de personnel, développement de nouveaux produits, etc.
    
    1. Fournis une description concise de l'entreprise (secteur d'activité, taille, positionnement sur le marché)
    2. Identifie 5-7 processus métier clés de cette entreprise qui sont essentiels à son fonctionnement
       • Chaque processus doit être clairement identifiable et isolé
       • Formule le nom de chaque processus de manière concise (2-5 mots)
       • Utilise des verbes d'action (gestion, traitement, développement, etc.)
    
    Réponds au format JSON avec deux champs :
    - "description": une description détaillée de l'entreprise en 3-4 phrases
    - "activities": une liste à puces des processus métier clés (chaque élément commençant par un tiret "-")
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
          { role: 'system', content: 'Tu es un assistant spécialisé dans l\'analyse de risques et la cybersécurité.' },
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
      const result = JSON.parse(content);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      // Si le JSON parsing échoue, retourner le contenu brut structuré manuellement
      console.warn('Could not parse OpenAI response as JSON, formatting manually:', parseError);
      
      let description = '';
      let activities = '';
      
      // Extraction simple basée sur le texte
      if (content.includes('description') || content.includes('Description')) {
        description = content.split(/description.*?:/i)[1]?.split(/activities|processus/i)[0].trim() || '';
      }
      
      if (content.includes('activités') || content.includes('processus') || content.includes('Activities')) {
        activities = content.split(/activités.*?:|processus.*?:|activities.*?:/i)[1]?.trim() || '';
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
    En tant qu'expert en analyse de risques pour l'entreprise "${companyName}", génère 4 à 6 scénarios de risque pertinents 
    pour les processus métier suivants:
    
    ${processesText}
    
    Pour chaque scénario:
    1. Donne un titre court et descriptif
    2. Fournis une description détaillée qui explique la nature du risque, ses causes potentielles et ses impacts
    
    Réponds au format JSON avec une liste d'objets, chacun ayant:
    - "id": un identifiant unique (format "scenario-X")
    - "name": le titre du scénario
    - "description": la description détaillée
    - "selected": true (tous les scénarios seront présélectionnés)
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
          { role: 'system', content: 'Tu es un expert en analyse de risques de cybersécurité qui aide à identifier les scénarios de risque pertinents.' },
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
    console.log('OpenAI risk scenarios received successfully');
    
    // Extraire et formater la réponse
    const content = responseData.choices[0].message.content;
    
    // Tenter de parser la réponse en JSON
    try {
      const scenarios = JSON.parse(content);
      return new Response(
        JSON.stringify(scenarios),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.warn('Could not parse OpenAI response as JSON, returning error:', parseError);
      throw new Error('Le format de réponse d\'OpenAI n\'est pas valide. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Error generating risk scenarios from OpenAI:', error);
    throw error;
  }
}
