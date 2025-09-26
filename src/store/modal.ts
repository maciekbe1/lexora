import { create } from "zustand";

export type ModalType =
  | "customFlashcard"
  | "customDeckCreation"
  | "deckEdit"
  | "templateDeckSelection"
  | "languagePreferences"
  | "deckOptions"
  | "floatingAction";

interface ModalState {
  activeModal: ModalType | null;
  modalProps: Record<string, any>;
  openModal: (type: ModalType, props?: Record<string, any>) => void;
  closeModal: () => void;
  updateModalProps: (props: Record<string, any>) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  modalProps: {},
  openModal: (type, props = {}) => set({ activeModal: type, modalProps: props }),
  closeModal: () => set({ activeModal: null, modalProps: {} }),
  updateModalProps: (props) =>
    set((state) => ({ modalProps: { ...state.modalProps, ...props } })),
}));