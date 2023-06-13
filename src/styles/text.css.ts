import { style } from "@vanilla-extract/css";
import { theme } from "./main.css";

export const error = style({
  color: theme.color.error
});

export const header = style({
  margin: "1rem 0"
});

export const noInteract = style({
  pointerEvents: "none"
});
