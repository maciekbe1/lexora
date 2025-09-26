import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import all translation files
import pl from "./pl";
import en from "./en";
import de from "./de";
import es from "./es";
import fr from "./fr";

// Storage key for user's language preference
const LANGUAGE_KEY = "@lexora/language";

// Initialize i18n
const i18n = new I18n({
  pl,
  en,
  de,
  es,
  fr,
});

// Set default language
i18n.defaultLocale = "pl";
i18n.locale = "pl";

// Enable fallbacks
i18n.enableFallback = true;

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const;

export type LanguageCode = typeof AVAILABLE_LANGUAGES[number]["code"];

// Initialize language from storage or device settings
export async function initializeLanguage(): Promise<void> {
  try {
    // First try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (savedLanguage && isValidLanguage(savedLanguage)) {
      i18n.locale = savedLanguage;
    } else {
      // Fallback to device language
      const deviceLanguage = Localization.getLocales()[0]?.languageCode || "pl";

      if (isValidLanguage(deviceLanguage)) {
        i18n.locale = deviceLanguage;
      } else {
        // Default to Polish
        i18n.locale = "pl";
      }
    }
  } catch (error) {
    console.error("Failed to initialize language:", error);
    i18n.locale = "pl";
  }
}

// Check if language code is valid
function isValidLanguage(code: string): code is LanguageCode {
  return AVAILABLE_LANGUAGES.some(lang => lang.code === code);
}

// Set and save language preference
export async function setLanguage(languageCode: LanguageCode): Promise<void> {
  try {
    i18n.locale = languageCode;
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
  } catch (error) {
    console.error("Failed to save language preference:", error);
  }
}

// Get current language
export function getCurrentLanguage(): LanguageCode {
  return i18n.locale as LanguageCode;
}

// Get language name by code
export function getLanguageName(code: LanguageCode): string {
  const language = AVAILABLE_LANGUAGES.find(lang => lang.code === code);
  return language?.name || code;
}

// Get language flag by code
export function getLanguageFlag(code: LanguageCode): string {
  const language = AVAILABLE_LANGUAGES.find(lang => lang.code === code);
  return language?.flag || "🌐";
}

// Export the configured i18n instance
export { i18n };

// Export translation function for convenience
export const t = (key: string, options?: any) => i18n.t(key, options);