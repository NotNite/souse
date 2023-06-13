import { useTheme } from "@/lib/hooks";
import { useAccountsStore } from "@/lib/stores/accounts";
import { useConnectionStore } from "@/lib/stores/connection";
import { PopupType, usePopupStore } from "@/lib/stores/popup";
import { getSecret, tryConnect } from "@/lib/tauri";
import React from "react";
import { Outlet } from "react-router";

import Roster from "@/components/app/Roster";
import Popup from "@/components/popup";
import { VerticalSplitter } from "@/components/misc";
import { bottomBar } from "@/styles/app.css";
import Avatar from "@/components/app/Avatar";

export default function App() {
  const theme = useTheme();

  const [popup, setCurrentPopup] = usePopupStore((state) => [
    state.currentPopup,
    state.setCurrentPopup
  ]);
  const connected = useConnectionStore((state) => state.connected);
  const currentAccount = useAccountsStore((state) => state.currentAccount);

  React.useEffect(() => {
    (async () => {
      if (connected) return;

      if (currentAccount === null) return setCurrentPopup(PopupType.SignIn);

      const password = await getSecret(currentAccount);
      if (!password) return setCurrentPopup(PopupType.SignIn);

      try {
        await tryConnect(currentAccount, password);
        setCurrentPopup(null);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  return (
    <div id="app" className={theme}>
      <Popup type={popup} />
      <Outlet />
      <div className={bottomBar}>
        <Avatar key={currentAccount} name={currentAccount!} />
        <VerticalSplitter />
        <Roster />
      </div>
    </div>
  );
}
