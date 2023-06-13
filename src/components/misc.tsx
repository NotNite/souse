import { splitter, verticalSplitter } from "@/styles/misc.css";

export function Splitter() {
  return <hr className={splitter} />;
}

export function VerticalSplitter() {
  return <div className={verticalSplitter} />;
}
