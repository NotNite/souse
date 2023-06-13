import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum ThemeSetting {
  System,
  Light,
  Dark
}

export type SettingsStore = {
  theme: ThemeSetting;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: ThemeSetting.System
    }),
    { name: "settings" }
  )
);
