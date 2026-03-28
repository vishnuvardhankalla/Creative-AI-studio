import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  geminiHttpErrorDetail,
  geminiTextGenerate,
  extractTextFromGemini,
  getGoogleApiKey,
} from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = getGoogleApiKey();
    const response = await geminiTextGenerate(apiKey, {
      systemInstruction: {
        parts: [{
          text: "You are an expert prompt engineer for image generation. Transform the user's simple request into a vivid, 50-70 word descriptive masterpiece. Include specific details about lighting (golden hour, dramatic shadows, soft diffused), camera angle (low angle, bird's eye, close-up macro), artistic style (cinematic, oil painting, hyperrealistic, cyberpunk), color palette, mood, and atmosphere. Output ONLY the enhanced prompt, no explanations.",
        }],
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!response.ok) {
      const status = response.status;
      const detail = await geminiHttpErrorDetail(response);
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`Gemini API error: ${status} ${detail}`);
    }

    const data = await response.json();
    const enhanced = extractTextFromGemini(data);

    return new Response(JSON.stringify({ enhanced }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("enhance-prompt error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
