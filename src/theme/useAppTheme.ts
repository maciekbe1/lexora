import { getColors } from './colors';
import { useTheme } from '@/hooks/useTheme';

export function useAppTheme() {
  const { effective } = useTheme();
  const colors = getColors(effective);
  return { colors, mode: effective } as const;
}

