import { style } from "@vanilla-extract/css";
import { theme } from "./main.css";
import { noInteract } from "./text.css";

export const bottomBar = style({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "4.5rem",

  padding: "0.5rem",

  borderTop: `1px solid ${theme.color.highlight}`,
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
});

export const roster = style({
  display: "flex",
  flexDirection: "column"
});

export const avatar = style({
  width: "3rem",
  height: "3rem",
  padding: 0,
  margin: 0,

  borderRadius: "25%",

  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

export const avatarText = style([
  noInteract,
  {
    fontSize: "1.5rem"
  }
]);
