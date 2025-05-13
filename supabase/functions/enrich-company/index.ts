
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
Fais une recherche sur internet pour cette la société  "${companyName}" et crée une fiche de synthèse. L'entreprise a partagé cette description: "${description || "Aucune description fournie."}".

Retourne uniquement un objet JSON avec ce format exact, sans texte d'explication, sans code block markdown:
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
          { role: 'system', content: 'Fais une recherche sur internet pour la société. Réponds uniquement avec du JSON sans explications ni formatage markdown.' },
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
      // Improved JSON extraction logic
      const jsonString = generatedText.trim();
      let processedString = jsonString;
      
      // Remove any markdown code block syntax if present
      processedString = processedString.replace(/```json|```/g, '').trim();
      
      enrichedData = JSON.parse(processedString);
      
      // Convertir creationYear en nombre
      if (enrichedData.creationYear) {
        const yearValue = parseInt(enrichedData.creationYear);
        enrichedData.creationYear = !isNaN(yearValue) ? yearValue : null;
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
