# Pear Media — AI Creative Studio

A web app for **text → image** workflows, **multi-style** generation, **summaries**, **background removal**, and **image analysis / variations**. The UI is a React SPA; AI runs in **Supabase Edge Functions** using the **Google Gemini API**.

## Stack

- **Frontend:** Vite 5, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase Edge Functions (Deno)
- **AI:** [Gemini](https://ai.google.dev/) (`gemini-2.5-flash`, `gemini-2.5-flash-image`)
- **Data / auth transport:** Supabase client (`@supabase/supabase-js`) for invoking functions

## Features

| Area | Description |
|------|-------------|
| **Creative Studio** | Enhance prompts, generate images, optional multi-style batch |
| **Style Lab** | Image-focused style / variation workflows |
| **Summarizer** | Condense long text into a short summary |
| **BG Remover** | Remove backgrounds from uploaded images (image in → image out) |

## Prerequisites

- **Node.js** 18+ (or 20+ recommended)
- A **Supabase** project with Edge Functions deployed for this repo’s `supabase/functions/*`
- A **Google AI / Gemini API key** with the Generative Language API enabled

## Environment variables




## Project layout (high level)

```
src/
  pages/           # Routes (e.g. Index)
  components/    # UI + workflow components (WorkflowText, etc.)
  integrations/supabase/
  utils/apiHelpers.ts   # supabase.functions.invoke(...) wrappers
supabase/
+ functions/     # Edge function entrypoints + _shared
```

## Security & keys

- Never commit `.env` or paste API keys into tickets/chat.  
- Restrict Gemini keys in Google Cloud (HTTP referrers / APIs used).  
- Rotate keys if they were exposed.

## License

Private project — add a `LICENSE` file if you open-source it.
