/** Google Gemini API — replaces Lovable AI gateway for edge functions */

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

export function getGoogleApiKey(): string {
  const key = Deno.env.get("GOOGLE_API_KEY") ?? Deno.env.get("GEMINI_API_KEY");
  if (!key?.trim()) throw new Error("GOOGLE_API_KEY not configured");
  return key.trim();
}

export function parseImageBase64(imageBase64: string): { mime: string; data: string } {
  const m = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (m) return { mime: m[1], data: m[2] };
  return { mime: "image/png", data: imageBase64.replace(/\s/g, "") };
}

export function inlineImagePart(imageBase64: string): { inline_data: { mime_type: string; data: string } } {
  const { mime, data } = parseImageBase64(imageBase64);
  return { inline_data: { mime_type: mime, data } };
}

function extractApiErrorMessage(data: unknown): string | null {
  const e = data as { error?: { message?: string; status?: string } };
  return e?.error?.message ?? null;
}

export function extractTextFromGemini(data: unknown): string {
  const apiErr = extractApiErrorMessage(data);
  if (apiErr) throw new Error(apiErr);
  const parts = (data as { candidates?: Array<{ content?: { parts?: unknown[] } }> }).candidates?.[0]?.content?.parts;
  if (!parts?.length) throw new Error("No response from model");
  let text = "";
  for (const part of parts as Array<{ text?: string }>) {
    if (typeof part?.text === "string") text += part.text;
  }
  return text.trim();
}

export function extractImageAndTextFromGemini(data: unknown): { text: string; imageUrl: string | null } {
  const apiErr = extractApiErrorMessage(data);
  if (apiErr) throw new Error(apiErr);
  const parts = (data as { candidates?: Array<{ content?: { parts?: unknown[] } }> }).candidates?.[0]?.content?.parts;
  if (!parts?.length) throw new Error("No response from model");
  let text = "";
  let imageUrl: string | null = null;
  for (const part of parts as Array<{
    text?: string;
    inlineData?: { mimeType?: string; mime_type?: string; data?: string };
    inline_data?: { mimeType?: string; mime_type?: string; data?: string };
  }>) {
    if (typeof part?.text === "string") text += part.text;
    const id = part?.inlineData ?? part?.inline_data;
    if (id?.data) {
      const mime = id.mimeType ?? id.mime_type ?? "image/png";
      imageUrl = `data:${mime};base64,${id.data}`;
    }
  }
  return { text: text.trim(), imageUrl };
}

export async function geminiTextGenerate(apiKey: string, body: Record<string, unknown>): Promise<Response> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function geminiImageGenerate(apiKey: string, body: Record<string, unknown>): Promise<Response> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function geminiHttpErrorDetail(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return extractApiErrorMessage(j) || JSON.stringify(j);
  } catch {
    return await res.text().catch(() => "");
  }
}
