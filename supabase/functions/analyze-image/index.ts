import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  geminiHttpErrorDetail,
  geminiTextGenerate,
  geminiImageGenerate,
  extractTextFromGemini,
  extractImageAndTextFromGemini,
  getGoogleApiKey,
  inlineImagePart,
} from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "Image data is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = getGoogleApiKey();

    const analysisResponse = await geminiTextGenerate(apiKey, {
      contents: [{
        role: "user",
        parts: [
          { text: "Analyze this image in detail. Return a JSON object with these exact keys:\n- \"subjects\": array of main objects/subjects\n- \"colors\": array of dominant colors (e.g. \"warm amber\", \"deep navy\")\n- \"style\": the artistic style (e.g. \"Cinematic\", \"Watercolor\", \"Cyberpunk\")\n- \"lighting\": description of lighting\n- \"mood\": overall mood/atmosphere\n- \"composition\": brief composition description\n\nReturn ONLY valid JSON, no markdown." },
          inlineImagePart(imageBase64),
        ],
      }],
    });

    if (!analysisResponse.ok) {
      const status = analysisResponse.status;
      const detail = await geminiHttpErrorDetail(analysisResponse);
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`Analysis failed: ${status} ${detail}`);
    }

    const analysisData = await analysisResponse.json();
    let analysisText = extractTextFromGemini(analysisData);

    analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = { subjects: ["unknown"], colors: ["varied"], style: "Mixed Media", lighting: "Natural", mood: "Neutral", composition: analysisText };
    }

    const variationPrompt = `Create a stunning artistic variation inspired by: ${analysis.subjects?.join(", ")} with a ${analysis.style} style. Use a color palette of ${analysis.colors?.join(", ")}. The lighting should be ${analysis.lighting}. The mood is ${analysis.mood}. Make it visually striking and unique while maintaining the core essence.`;

    const imageResponse = await geminiImageGenerate(apiKey, {
      contents: [{ role: "user", parts: [{ text: variationPrompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    });

    if (!imageResponse.ok) {
      const detail = await geminiHttpErrorDetail(imageResponse);
      throw new Error(`Image generation failed: ${imageResponse.status} ${detail}`);
    }

    const imageData = await imageResponse.json();
    const { imageUrl: variationUrl } = extractImageAndTextFromGemini(imageData);

    return new Response(JSON.stringify({ analysis, variationPrompt, variationUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
