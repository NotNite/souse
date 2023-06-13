import { create } from "zustand";
import {
  ConnectedMessage,
  DisconnectedMessage,
  send,
  useViteEvent
} from "@/lib/tauri";

export type ConnectionStore = {
  connected: boolean;
  jid: string | null;
  setConnected: (connected: boolean) => void;
  setJid: (jid: string | null) => void;
};

export const useConnectionStore = create<ConnectionStore>()((set) => ({
  connected: false,
  jid: null,

  setConnected: (connected: boolean) => set({ connected }),
  setJid: (jid: string | null) => set({ jid })
}));

useViteEvent<ConnectedMessage>("connected", async (e) => {
  useConnectionStore.setState({
    connected: true,
    jid: e.payload
  });
});

useViteEvent<DisconnectedMessage>("disconnected", async (e) => {
  useConnectionStore.setState({
    ...useConnectionStore.getState(),
    connected: false
  });
});
