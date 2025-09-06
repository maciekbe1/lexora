import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import { fetchUserPreferences, upsertUserPreferences } from '@/services/preferences';
import * as Localization from 'expo-localization';
import { create } from 'zustand';

function normalizeLangCode(code?: string | null): string | null {
  if (!code) return null;
  const c = code.toLowerCase();
  const match = SUPPORTED_LANGUAGES.find(l => c === l.code || c.startsWith(l.code));
  return match ? match.code : null;
}

function recommendedTarget(native: string): string {
  const map: Record<string, string> = {
    en: 'es',
    es: 'en',
    pl: 'en',
    de: 'en',
    fr: 'en',
    it: 'en',
  };
  const n = normalizeLangCode(native) || 'en';
  const t = map[n] || 'en';
  return t === n ? 'en' : t;
}

function deviceDefault(): { native: string; target: string } {
  // Try to derive user's device language
  const sys = (Localization.getLocales()[0]?.languageTag || 'en').toLowerCase();
  const native = normalizeLangCode(sys) || 'en';
  const target = recommendedTarget(native);
  return { native, target };
}

interface PreferencesState {
  nativeLanguage: string;
  targetLanguage: string;
  loading: boolean;
  error: string | null;
  hasServerRecord: boolean; // true if fetched existing prefs from server

  initDefaults: () => void;
  loadFromServer: (userId: string) => Promise<void>;
  setNative: (lang: string) => void;
  setTarget: (lang: string) => void;
  saveToServer: (userId: string) => Promise<boolean>;
  reset: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  nativeLanguage: deviceDefault().native,
  targetLanguage: deviceDefault().target,
  loading: false,
  error: null,
  hasServerRecord: false,

  initDefaults: () => {
    const d = deviceDefault();
    set({ nativeLanguage: d.native, targetLanguage: d.target });
  },

  loadFromServer: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchUserPreferences(userId);
      if (data) {
        const native = normalizeLangCode(data.native_language) || get().nativeLanguage;
        const target = normalizeLangCode(data.target_language) || get().targetLanguage;
        set({ nativeLanguage: native, targetLanguage: target, hasServerRecord: true });
      } else {
        // No server record — ensure defaults from device
        get().initDefaults();
        set({ hasServerRecord: false });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  // Allow any combination; only defaults use recommended mapping
  setNative: (lang: string) => set({ nativeLanguage: normalizeLangCode(lang) || 'en' }),
  setTarget: (lang: string) => set({ targetLanguage: normalizeLangCode(lang) || 'en' }),

  saveToServer: async (userId: string) => {
    const { nativeLanguage, targetLanguage } = get();
    const ok = await upsertUserPreferences(userId, {
      native_language: nativeLanguage,
      target_language: targetLanguage,
    });
    if (ok) set({ hasServerRecord: true });
    return ok;
  },

  reset: () => set({
    nativeLanguage: deviceDefault().native,
    targetLanguage: deviceDefault().target,
    loading: false,
    error: null,
    hasServerRecord: false,
  })
}));
