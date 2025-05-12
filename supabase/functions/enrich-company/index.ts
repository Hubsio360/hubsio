
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { companyId, companyName, description } = await req.json();
    
    if (!companyId || !companyName) {
      return new Response(JSON.stringify({ 
        error: 'Company ID and name are required' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Construire un prompt pour OpenAI
    const prompt = `
Génère un profil d'entreprise réaliste en français pour "${companyName}". L'entreprise a partagé cette description: "${description || "Aucune description fournie."}".

Retourne un objet JSON avec ce format exact, en utilisant que des valeurs réalistes basées sur le nom et la description:
{
  "activity": "Description de l'activité principale (max 200 caractères)",
  "creationYear": "Année de création (un nombre entre 1990 et 2023)",
  "parentCompany": "Société mère éventuelle ou null",
  "marketScope": "Portée du marché (Local, National, International, etc.)"
}
`;

    console.log('Sending request to OpenAI for company enrichment');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en analyse d\'entreprises qui génère des profils d\'entreprise réalistes.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const generatedText = data.choices[0].message.content;
    
    let enrichedData;
    try {
      // Extraire le JSON de la réponse
      enrichedData = JSON.parse(generatedText.replace(/```json|```/g, '').trim());
      
      // Convertir creationYear en nombre
      if (enrichedData.creationYear) {
        enrichedData.creationYear = parseInt(enrichedData.creationYear);
        if (isNaN(enrichedData.creationYear)) {
          enrichedData.creationYear = null;
        }
      }
      
      console.log('Enriched data generated:', enrichedData);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error, generatedText);
      throw new Error('Failed to parse company data');
    }

    return new Response(JSON.stringify({ success: true, data: enrichedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enrich-company function:', error);
    return new Response(JSON.stringify({ error: error.message || 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
