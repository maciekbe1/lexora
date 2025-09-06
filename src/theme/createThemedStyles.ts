import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from './useAppTheme';
import type { AppThemeColors } from './colors';

export function createThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: (c: AppThemeColors) => T) {
  return function useThemedStyles() {
    const { colors } = useAppTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

