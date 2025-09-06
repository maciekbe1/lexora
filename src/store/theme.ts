import * as SecureStore from 'expo-secure-store';
import { Appearance, ColorSchemeName } from 'react-native';
import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  systemScheme: NonNullable<ColorSchemeName>; // 'light' | 'dark'
  effective: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  init: () => () => void;
}

function computeEffective(mode: ThemeMode, system: 'light' | 'dark') {
  return mode === 'system' ? system : mode;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  systemScheme: ((Appearance.getColorScheme() || 'light') as NonNullable<ColorSchemeName>),
  effective: computeEffective('system', (Appearance.getColorScheme() || 'light') as 'light' | 'dark'),
  setMode: (mode: ThemeMode) => {
    // persist asynchronously; no need to await
    SecureStore.setItemAsync('lexora_theme_mode', mode, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }).catch(() => {});
    set((state) => ({ mode, effective: computeEffective(mode, state.systemScheme) }));
  },
  init: () => {
    // Load persisted mode if available
    SecureStore.getItemAsync('lexora_theme_mode', { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK })
      .then((saved) => {
        if (!saved) return;
        if (saved === 'system' || saved === 'light' || saved === 'dark') {
          const { systemScheme } = get();
          set({ mode: saved, effective: computeEffective(saved, systemScheme) });
        }
      })
      .catch(() => {});

    const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      const scheme = (colorScheme || 'light') as NonNullable<ColorSchemeName>;
      const { mode } = get();
      set({ systemScheme: scheme, effective: computeEffective(mode, scheme) });
    };
    const sub = Appearance.addChangeListener(listener);
    return () => {
      try {
        // RN >= 0.65 returns subscription with remove()

        (sub as any)?.remove?.();
      } catch {
        // ignore
      }
    };
  },
}));
