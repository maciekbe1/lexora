import { create } from 'zustand';

export interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: 'info',
  visible: false,

  show: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    set({ message, type, visible: true });
    // Auto-hide after 5 seconds for non-error messages
    if (type !== 'error') {
      setTimeout(() => {
        set({ visible: false });
      }, 5000);
    }
  },

  hide: () => set({ visible: false }),
}));