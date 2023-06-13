import { create } from "zustand";

export enum PopupType {
  SignIn
}

export type PopupStore = {
  currentPopup: PopupType | null;
  setCurrentPopup: (popup: PopupType | null) => void;
};

export const usePopupStore = create<PopupStore>()((set) => ({
  currentPopup: null,
  setCurrentPopup: (popup) => set({ currentPopup: popup })
}));
