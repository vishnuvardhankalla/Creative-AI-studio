import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  geminiHttpErrorDetail,
  geminiImageGenerate,
  extractImageAndTextFromGemini,
  getGoogleApiKey,
} from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STYLES = {
  cyberpunk: "in a cyberpunk neon-lit futuristic style with glowing lights, rain-slicked streets, and holographic elements",
  watercolor: "as a delicate watercolor painting with soft washes of color, visible brushstrokes, and paper texture",
  "oil-painting": "as a classical oil painting with rich impasto textures, dramatic chiaroscuro lighting, and Renaissance composition",
  "pop-art": "in bold pop art style inspired by Andy Warhol and Roy Lichtenstein with halftone dots, bright primary colors, and thick outlines",
  "anime": "in detailed anime/manga style with large expressive eyes, dynamic poses, and vibrant cel-shading",
  "3d-render": "as a high-quality 3D render with realistic materials, global illumination, and cinematic depth of field",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, styles } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const selectedStyles: string[] = styles || Object.keys(STYLES);
    const apiKey = getGoogleApiKey();

    const results = [];
    for (const style of selectedStyles) {
      const styleDesc = STYLES[style as keyof typeof STYLES] || style;
      const styledPrompt = `${prompt}, ${styleDesc}`;

      try {
        const response = await geminiImageGenerate(apiKey, {
          contents: [{ role: "user", parts: [{ text: `Generate a high-quality image: ${styledPrompt}` }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        });

        if (response.status === 429) {
          results.push({ style, error: "Rate limited, skipping" });
          continue;
        }
        if (!response.ok) {
          const detail = await geminiHttpErrorDetail(response);
          results.push({ style, error: `Failed: ${response.status} ${detail}` });
          continue;
        }

        const data = await response.json();
        const { imageUrl } = extractImageAndTextFromGemini(data);
        results.push({ style, imageUrl: imageUrl || null, error: imageUrl ? null : "No image generated" });
      } catch (e) {
        results.push({ style, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("multi-style error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
