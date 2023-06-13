import {
  createTheme,
  createThemeContract,
  globalStyle
} from "@vanilla-extract/css";

enum Colors {
  Lightest = "#ffffff",
  Lighter = "#f5f5f5",
  Light = "#eeeeee",
  Grey = "#cccccc",
  Dark = "#aaaaaa",
  Darker = "#222222",
  Darkest = "#000000",

  Error = "#f04040"
}

export const theme = createThemeContract({
  color: {
    background: null,
    text: null,
    input: null,
    highlight: null,
    error: Colors.Error
  }
});

export const lightTheme = createTheme(theme, {
  color: {
    background: Colors.Lightest,
    text: Colors.Darkest,
    input: Colors.Lighter,
    highlight: Colors.Light,
    error: Colors.Error
  }
});

export const darkTheme = createTheme(theme, {
  color: {
    background: Colors.Darkest,
    text: Colors.Lightest,
    input: Colors.Darker,
    highlight: Colors.Dark,
    error: Colors.Error
  }
});

globalStyle("*", {
  boxSizing: "border-box",
  padding: 0,
  margin: 0,
  fontFamily: "Inter"
});

globalStyle("#app", {
  minWidth: "100vw",
  minHeight: "100vh",
  padding: "0.5rem",
  backgroundColor: theme.color.background,
  color: theme.color.text,
  overflow: "hidden"
});

globalStyle("p, label, span", {
  color: theme.color.text
});
