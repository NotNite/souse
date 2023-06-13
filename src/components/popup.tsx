import { PopupType } from "@/lib/stores/popup";
import { popup, popupContainer } from "@/styles/forms.css";

import SignIn from "./popups/SignIn";

export default function Popup({ type }: { type: PopupType | null }) {
  if (type == null) return <></>;

  let children = null;
  switch (type) {
    case PopupType.SignIn:
      children = <SignIn />;
      break;
  }

  return (
    <div className={popupContainer}>
      <div className={popup}>{children}</div>
    </div>
  );
}
