import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { localDatabase } from '../services/local-database';
import { storageService } from '../services/storage';
import { syncService } from '../services/sync';

export function useAppInitialization(user: User | null) {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeApp = async () => {
    if (!user || isInitialized) return;

    try {
      console.log('Initializing app...');

      await localDatabase.initialize();
      await localDatabase.clearInvalidCustomDecks();
      await storageService.initializeStorage();

      try {
        await syncService.syncFromRemote(user.id);
      } catch (error) {
        console.log('Could not sync from remote (offline?):', error);
      }

      setIsInitialized(true);
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  useEffect(() => {
    if (user && !isInitialized) {
      initializeApp();
    }
  }, [user, isInitialized]);

  return { isInitialized };
}
