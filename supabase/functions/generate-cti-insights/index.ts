
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
    const { prompt } = await req.json();

    // Format des instructions spécifiques pour la génération de CTI
    const systemPrompt = `Tu es un expert en Cyber Threat Intelligence (CTI) spécialisé dans l'analyse des menaces cyber et la production de renseignements stratégiques de haute qualité. 

Analyse la requête de l'utilisateur et génère un rapport CTI structuré et détaillé qui :
1. Identifie clairement les menaces, vulnérabilités ou acteurs malveillants pertinents
2. Fournit un contexte stratégique et technique précis
3. Évalue l'impact potentiel et la probabilité
4. Offre des recommandations concrètes et applicables

Format ton rapport avec les sections suivantes (en utilisant le format Markdown):
# Résumé exécutif
(Synthèse concise des principales conclusions)

## Analyse des menaces
(Détails des menaces identifiées)

## Acteurs malveillants
(Groupes ou individus responsables)

## Vecteurs d'attaque
(Comment les attaques sont perpétrées)

## Impact et risques
(Conséquences possibles)

## Indicateurs de compromission
(Si applicable)

## Recommandations
(Actions concrètes à entreprendre)

Utilise [IMPORTANT], [ALERTE] ou [CRITIQUE] pour mettre en évidence les informations critiques.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-cti-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
