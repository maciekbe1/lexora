import { useThemeStore } from '@/store/theme';
import { useEffect } from 'react';

export function useTheme() {
  const { mode, systemScheme, effective, setMode, init } = useThemeStore();
  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);
  return { mode, systemScheme, effective, setMode };
}
