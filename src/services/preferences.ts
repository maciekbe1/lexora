import { supabase } from '../../lib/supabase';

export interface UserPreferences {
  native_language: string;
  target_language: string;
}

export async function fetchUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('native_language, target_language')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as UserPreferences;
  } catch {
    return null;
  }
}

export async function upsertUserPreferences(userId: string, prefs: UserPreferences): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...prefs });
    return !error;
  } catch {
    return false;
  }
}

