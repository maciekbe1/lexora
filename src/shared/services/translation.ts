// Lightweight translation client with graceful fallback.
// Configure a LibreTranslate-compatible endpoint via EXPO_PUBLIC_TRANSLATE_ENDPOINT.
// Optionally add EXPO_PUBLIC_TRANSLATE_API_KEY if your instance requires it.

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const endpoint = process.env.EXPO_PUBLIC_TRANSLATE_ENDPOINT;
  const apiKey = process.env.EXPO_PUBLIC_TRANSLATE_API_KEY;

  // Guard clauses
  if (!text.trim()) return "";
  if (!targetLang) return text;

  // If no endpoint configured, return the original text to avoid failures
  if (!endpoint) {
    return text;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang || "auto",
        target: targetLang,
        format: "text",
      }),
    });

    if (!res.ok) {
      // On error, fall back to original text
      return text;
    }

    const data = await res.json();
    // LibreTranslate returns { translatedText }
    const translated = data?.translatedText || data?.translation || "";
    return translated || text;
  } catch (e) {
    // Network disabled or request failed — just return original text
    return text;
  }
}

