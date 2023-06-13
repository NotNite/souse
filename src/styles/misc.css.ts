import { style } from "@vanilla-extract/css";
import { theme } from "./main.css";

export const splitter = style({
  width: "100%",
  height: "1px",
  margin: "0.5rem 0",
  backgroundColor: theme.color.highlight
});

export const verticalSplitter = style({
  width: "1px",
  height: "100%",
  margin: "0 0.5rem",
  backgroundColor: theme.color.highlight
});
