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
  setMode: (mode: ThemeMode) => set((state) => ({ mode, effective: computeEffective(mode, state.systemScheme) })),
  init: () => {
    const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      const scheme = (colorScheme || 'light') as NonNullable<ColorSchemeName>;
      const { mode } = get();
      set({ systemScheme: scheme, effective: computeEffective(mode, scheme) });
    };
    const sub = Appearance.addChangeListener(listener);
    return () => {
      try {
        // RN >= 0.65 returns subscription with remove()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sub as any)?.remove?.();
      } catch {
        // ignore
      }
    };
  },
}));
