import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  geminiHttpErrorDetail,
  geminiImageGenerate,
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
    const response = await geminiImageGenerate(apiKey, {
      contents: [{
        role: "user",
        parts: [
          { text: "Remove the background from this image completely. Keep only the main subject with a transparent/white background. Make the cutout clean and precise with smooth edges." },
          inlineImagePart(imageBase64),
        ],
      }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    });

    if (!response.ok) {
      const status = response.status;
      const detail = await geminiHttpErrorDetail(response);
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`Gemini API error: ${status} ${detail}`);
    }

    const data = await response.json();
    const { imageUrl } = extractImageAndTextFromGemini(data);

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Background removal failed. Try a different image." }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ imageUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("remove-bg error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
