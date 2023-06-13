import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RosterEntry } from "../types";
import {
  ConnectedMessage,
  StanzaMessage,
  listenStanza,
  sendReceive,
  sendWithId,
  useViteEvent
} from "../tauri";
import { IQ, Presence, Query, VCard } from "../elements";
import { useConnectionStore } from "./connection";
import { useCacheStore } from "./cache";

export type RosterStore = {
  entries: RosterEntry[];
  mergeEntry: (entry: RosterEntry) => void;
  getEntry: (jid: string) => RosterEntry | null;
};

export const useRosterStore = create<RosterStore>()(
  persist(
    (set, get) => ({
      entries: [],
      mergeEntry: (entry) => {
        const entries = get().entries;
        const origEntry = entries.find((x) => x.jid === entry.jid);
        if (origEntry) {
          const newEntry = {
            ...origEntry,
            ...entry
          };
          set({
            entries: entries.map((x) => (x.jid === entry.jid ? newEntry : x))
          });
        } else {
          set({
            entries: [...entries, entry]
          });
        }
      },
      getEntry: (jid) => {
        const entries = get().entries;
        const entry = entries.find((e) => e.jid === jid);
        return entry ?? null;
      }
    }),
    { name: "roster" }
  )
);

useViteEvent<ConnectedMessage>("connected", async (e) => {
  await sendWithId(
    <IQ from={e.payload} type="get">
      <Query xmlns="jabber:iq:roster" />
    </IQ>
  );

  await sendWithId(<Presence />);
});

useViteEvent<StanzaMessage>(
  "stanza",
  listenStanza(async (stanza) => {
    const root = stanza.documentElement;
    const jid = useConnectionStore.getState().jid;

    const from = root.getAttribute("from");
    const to = root.getAttribute("to");
    if (to !== jid) return;

    // Handle roster
    if (root.tagName === "iq") {
      const roster = root.querySelector("query");
      if (roster) {
        for (const item of roster.querySelectorAll("item")) {
          const jid = item.getAttribute("jid");
          const name = item.getAttribute("name");
          const subscription = item.getAttribute("subscription");

          if (jid === null || subscription === null) continue;
          useRosterStore.getState().mergeEntry({
            jid,
            name,
            subscription,
            groups: []
          });
        }
      }
    }

    // Handle presence
    if (root.tagName == "presence") {
      for (const x of root.querySelectorAll("x")) {
        if (x.getAttribute("xmlns") === "vcard-temp:x:update") {
          const photo = x.querySelector("photo")?.textContent;
          const filePath = `avatars/${photo}`;

          const cacheStore = useCacheStore.getState();
          const rosterStore = useRosterStore.getState();

          const photoNotCached = !(await cacheStore.fileExists(filePath));
          const vcardNotFetched =
            rosterStore.getEntry(from ?? "")?.vcard === undefined;

          if (photo && (photoNotCached || vcardNotFetched)) {
            const toJid = (from ?? "").split("/")[0];
            const vcard = await sendReceive(
              <IQ from={jid} to={toJid} type="get">
                <VCard />
              </IQ>
            );

            const photoEl = vcard.querySelector("PHOTO");
            if (photoEl) {
              const binval = photoEl.querySelector("BINVAL")?.textContent;
              if (!binval) continue;

              const b64 = atob(binval);
              const arr = new Uint8Array(b64.length);
              for (let i = 0; i < b64.length; i++) arr[i] = b64.charCodeAt(i);

              await cacheStore.writeFile(filePath, arr);
            }

            // xmldocument to str
            const serializer = new XMLSerializer();
            const str = serializer.serializeToString(vcard);
            rosterStore.mergeEntry({
              ...rosterStore.getEntry(toJid)!,
              vcard: str,
              avatar: photo
            });
          }
        }
      }
    }
  })
);
