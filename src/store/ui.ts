import { create } from 'zustand';

interface UIOverlayState {
  overlayCount: number;
  incOverlay: () => void;
  decOverlay: () => void;
}

export const useUIOverlayStore = create<UIOverlayState>((set, get) => ({
  overlayCount: 0,
  incOverlay: () => set({ overlayCount: get().overlayCount + 1 }),
  decOverlay: () => {
    const next = Math.max(0, get().overlayCount - 1);
    set({ overlayCount: next });
  },
}));

