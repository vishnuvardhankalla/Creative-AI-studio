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
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Text is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = getGoogleApiKey();
    const response = await geminiTextGenerate(apiKey, {
      systemInstruction: {
        parts: [{
          text: "You are a concise summarizer. Summarize the given text into 2-3 clear, informative sentences. Capture the key points and essence. Output ONLY the summary.",
        }],
      },
      contents: [{ role: "user", parts: [{ text }] }],
    });

    if (!response.ok) {
      const status = response.status;
      const detail = await geminiHttpErrorDetail(response);
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`Gemini API error: ${status} ${detail}`);
    }

    const data = await response.json();
    const summary = extractTextFromGemini(data);

    return new Response(JSON.stringify({ summary }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("summarize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
