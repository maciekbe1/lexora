import { useNotificationStore } from '@/store/notification';
import { syncService } from './sync';

class BackgroundSyncService {
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private currentUserId: string | null = null;

  /**
   * Start background sync for a user
   */
  startBackgroundSync(userId: string) {
    if (this.currentUserId === userId && this.syncInterval) {
      return; // Already running for this user
    }
    
    this.stopBackgroundSync();
    this.currentUserId = userId;
    
    // Start periodic sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.performBackgroundSync(userId);
    }, 5 * 60 * 1000);

    // Also perform initial sync
    this.performBackgroundSync(userId);
  }

  /**
   * Stop background sync
   */
  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.currentUserId = null;
  }

  /**
   * Perform a single background sync with error notifications
   */
  private async performBackgroundSync(userId: string) {
    try {
      await syncService.autoSync(userId);
    } catch (error) {
      console.error('Background sync failed:', error);
      
      // Show error notification
      const notificationStore = useNotificationStore.getState();
      let message = 'Synchronizacja danych nie powiodła się';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          message = 'Błąd połączenia - sprawdź internet';
        } else if (error.message.includes('401') || error.message.includes('auth')) {
          message = 'Błąd autoryzacji - zaloguj się ponownie';
        }
      }
      
      notificationStore.show(message, 'error');
    }
  }

  /**
   * Force sync now (for manual refresh)
   */
  async forceSyncNow(userId: string) {
    return this.performBackgroundSync(userId);
  }
}

export const backgroundSyncService = new BackgroundSyncService();