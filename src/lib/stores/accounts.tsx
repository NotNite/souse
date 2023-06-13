import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccountsStore = {
  jids: string[];
  currentAccount: string | null;
  setCurrentAccount: (jid: string) => void;
};

export const useAccountsStore = create<AccountsStore>()(
  persist(
    (set) => ({
      jids: [],
      currentAccount: null,
      setCurrentAccount: (jid) =>
        set((state) => ({
          currentAccount: jid,
          jids: Array.from(new Set([...state.jids, jid]))
        }))
    }),
    { name: "accounts" }
  )
);
