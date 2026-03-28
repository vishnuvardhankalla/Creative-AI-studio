import { supabase } from "@/integrations/supabase/client";

export const enhancePrompt = async (prompt: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("enhance-prompt", {
    body: { prompt },
  });
  if (error) throw new Error(error.message || "Failed to enhance prompt");
  if (data?.error) throw new Error(data.error);
  return data.enhanced;
};

export const generateImage = async (prompt: string): Promise<{ imageUrl: string; text?: string }> => {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: { prompt },
  });
  if (error) throw new Error(error.message || "Failed to generate image");
  if (data?.error) throw new Error(data.error);
  return { imageUrl: data.imageUrl, text: data.text };
};

export const analyzeImage = async (imageBase64: string): Promise<{
  analysis: Record<string, unknown>;
  variationPrompt: string;
  variationUrl?: string;
}> => {
  const { data, error } = await supabase.functions.invoke("analyze-image", {
    body: { imageBase64 },
  });
  if (error) throw new Error(error.message || "Failed to analyze image");
  if (data?.error) throw new Error(data.error);
  return data;
};

export const generateMultiStyle = async (prompt: string, styles: string[]): Promise<{
  results: Array<{ style: string; imageUrl?: string; error?: string }>;
}> => {
  const { data, error } = await supabase.functions.invoke("multi-style", {
    body: { prompt, styles },
  });
  if (error) throw new Error(error.message || "Failed to generate styles");
  if (data?.error) throw new Error(data.error);
  return data;
};

export const summarizeText = async (text: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("summarize", {
    body: { text },
  });
  if (error) throw new Error(error.message || "Failed to summarize");
  if (data?.error) throw new Error(data.error);
  return data.summary;
};

export const removeBackground = async (imageBase64: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("remove-background", {
    body: { imageBase64 },
  });
  if (error) throw new Error(error.message || "Failed to remove background");
  if (data?.error) throw new Error(data.error);
  return data.imageUrl;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
