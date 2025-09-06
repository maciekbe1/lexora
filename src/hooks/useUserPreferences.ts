import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { fetchUserPreferences, upsertUserPreferences, UserPreferences } from '@/services/preferences';

export function useUserPreferences() {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      setLoading(true);
      const data = await fetchUserPreferences(user.id);
      if (mounted) {
        setPrefs(data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const save = async (next: UserPreferences) => {
    if (!user) return false;
    setError(null);
    const ok = await upsertUserPreferences(user.id, next);
    if (ok) setPrefs(next);
    else setError('Nie udało się zapisać preferencji');
    return ok;
  };

  return { prefs, loading, error, save };
}

