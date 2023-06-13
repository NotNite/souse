import { darkTheme, lightTheme } from "@/styles/main.css";
import { ThemeSetting, useSettingsStore } from "./stores/settings";

export function useTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultTheme = prefersDark ? darkTheme : lightTheme;

  const theme = useSettingsStore((store) => store.theme);
  switch (theme) {
    case ThemeSetting.System:
      return defaultTheme;
    case ThemeSetting.Light:
      return lightTheme;
    case ThemeSetting.Dark:
      return darkTheme;
  }
}
