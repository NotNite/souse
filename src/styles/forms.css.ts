import { style, keyframes } from "@vanilla-extract/css";
import { theme } from "./main.css";

export const form = style({
  display: "flex",
  flexDirection: "column"
});

export const formRow = style({
  display: "flex",
  flexDirection: "column",
  margin: "1rem 0"
});

export const input = style({
  width: "fit-content",
  color: theme.color.text,
  backgroundColor: theme.color.input,
  border: "none",
  borderRadius: "0.25rem",
  padding: "0.25rem"
});

export const button = style([input, { padding: "0.25rem 1rem" }]);

export const popupContainer = style({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 1000,

  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)"
});

export const popIn = keyframes({
  "0%": { opacity: 0, transform: "scale(0.5)" },
  "100%": { opacity: 1, transform: "scale(1)" }
});

export const popup = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",

  minWidth: "50vw",
  minHeight: "75vh",

  borderRadius: "0.25rem",
  border: `2px solid ${theme.color.text}`,
  backgroundColor: theme.color.background,

  animation: `${popIn} 0.25s ease`
});
