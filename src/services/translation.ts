// Translation client calling your Supabase Edge Function.
// The function URL can be provided via EXPO_PUBLIC_TRANSLATE_ENDPOINT.
// If not provided, it defaults to `${SUPABASE_URL}/functions/v1/translate`.

import Constants from 'expo-constants';
import { supabase } from '../../lib/supabase';

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  // Guard clauses
  if (!text.trim()) return "";
  if (!targetLang) return text;

  const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL as string | undefined;
  const endpoint =
    process.env.EXPO_PUBLIC_TRANSLATE_ENDPOINT ||
    (supabaseUrl ? `${supabaseUrl}/functions/v1/translate` : undefined);

  if (!endpoint) {
    return text;
  }

  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text,
        src: (sourceLang || 'auto').toUpperCase(),
        dst: targetLang.toUpperCase(),
      }),
    });

    if (!res.ok) {
      return text;
    }

    const dataJson = await res.json();
    const translated = dataJson?.translated ?? '';
    return translated || text;
  } catch {
    return text;
  }
}
