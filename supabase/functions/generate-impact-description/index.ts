
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { scenarioDescription } = await req.json();

    if (!scenarioDescription) {
      return new Response(
        JSON.stringify({ error: "La description du scénario est requise" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openAIKey = Deno.env.get("OPENAI_API_KEY");

    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: "La clé API OpenAI n'est pas configurée" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call OpenAI API to generate impact description
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: 
              "Tu es un expert en analyse de risque et en cybersécurité. Tu dois analyser une description de scénario de risque et générer une description d'impact détaillée et réaliste. " +
              "La description doit expliquer les conséquences directes et indirectes du risque sur différents aspects : financier, opérationnel, réputation, conformité réglementaire et impact sur les données personnelles si pertinent. " +
              "Sois précis, factuel et concis (maximum 150 mots). Utilise des phrases complètes et cohérentes."
          },
          {
            role: "user",
            content: `Analyse ce scénario de risque et génère une description détaillée de son impact potentiel:\n\n${scenarioDescription}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Format de réponse OpenAI invalide");
    }

    const impactDescription = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ impactDescription }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
