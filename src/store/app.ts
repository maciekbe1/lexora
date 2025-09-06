import { localDatabase } from '@/services/local-database';
import { storageService } from '@/services/storage';
import { syncService } from '@/services/sync';
import { create } from 'zustand';

interface AppInitState {
  initializedForUserId: string | null;
  initializing: boolean;
  error: string | null;
  initializeIfNeeded: (userId: string) => Promise<void>;
  resetInit: () => void;
}

export const useAppStore = create<AppInitState>((set, get) => ({
  initializedForUserId: null,
  initializing: false,
  error: null,

  initializeIfNeeded: async (userId: string) => {
    const { initializedForUserId, initializing } = get();
    if (!userId) return;
    if (initializing) return;
    if (initializedForUserId === userId) return;

    set({ initializing: true, error: null });
    try {
      await localDatabase.initialize();
      await storageService.initializeStorage();
      try {
        await syncService.syncFromRemote(userId);
      } catch (e) {
        // Non-fatal: allow app to proceed offline
        console.log('Initial remote sync failed (non-fatal):', e);
      }
      set({ initializedForUserId: userId });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ initializing: false });
    }
  },

  resetInit: () => set({ initializedForUserId: null, initializing: false, error: null }),
}));

