import { createClient } from "@supabase/supabase-js";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// eslint-disable-next-line complexity
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const DEEPL_API_KEY = Deno.env.get("DEEPL_API_KEY");
    const DEEPL_HOST = Deno.env.get("DEEPL_API_HOST") ?? "api-free.deepl.com"; // Free → api-free.deepl.com, Pro → api.deepl.com

    if (!DEEPL_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing DEEPL_API_KEY" }), { status: 500, headers: jsonHeaders });
    }

    // Wymuś zalogowanie: weryfikacja JWT przez Supabase
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500, headers: jsonHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    // Parse body
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: jsonHeaders });
    }

    const text = String(payload?.text ?? "").trim();
    const src = String(payload?.src ?? "EN").toUpperCase();
    const dst = String(payload?.dst ?? "PL").toUpperCase();

    if (!text) {
      return new Response(JSON.stringify({ translated: "" }), { headers: jsonHeaders });
    }

    // Opcjonalny limit, by uniknąć zbyt dużych żądań/kosztów
    if (text.length > 5000) {
      return new Response(JSON.stringify({ error: "Text too long", max: 5000 }), { status: 413, headers: jsonHeaders });
    }

    // Wywołanie DeepL
    const body = new URLSearchParams({
      text,
      source_lang: src,
      target_lang: dst,
      preserve_formatting: "1",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const resp = await fetch(`https://${DEEPL_HOST}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!resp.ok) {
      const msg = await resp.text();
      return new Response(
        JSON.stringify({ error: "Provider error", status: resp.status, details: msg }),
        { status: 502, headers: jsonHeaders }
      );
    }

    const json = await resp.json();
    const translated = json?.translations?.[0]?.text ?? "";
    return new Response(JSON.stringify({ translated }), { headers: jsonHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: jsonHeaders });
  }
});

/* Local testing

  1) supabase start
  2) curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/translate' \
       --header "Authorization: Bearer <your-jwt>" \
       --header 'Content-Type: application/json' \
       --data '{"text":"Hello world","src":"EN","dst":"PL"}'

*/
