import { invoke } from "@tauri-apps/api";
import ReactDOMServer from "react-dom/server";
import {
  Event,
  EventCallback,
  UnlistenFn,
  listen
} from "@tauri-apps/api/event";
import React from "react";
import { v4 } from "uuid";

export async function connect(jid: string, password: string) {
  await invoke("connect", { jid, password });
}

export async function send(stanza: JSX.Element) {
  const str = ReactDOMServer.renderToStaticMarkup(stanza);
  await invoke("send", { stanza: str });
}

export async function sendWithId(stanza: JSX.Element) {
  const id = v4();
  stanza = React.cloneElement(stanza, { id });
  const str = ReactDOMServer.renderToStaticMarkup(stanza);
  await invoke("send", { stanza: str });
}

export async function sendReceive(stanza: JSX.Element) {
  const id = v4();
  stanza = React.cloneElement(stanza, { id });
  const str = ReactDOMServer.renderToStaticMarkup(stanza);
  await invoke("send", { stanza: str });

  return new Promise<XMLDocument>(async (resolve) => {
    const unlisten = await listen<StanzaMessage>("stanza", (e) => {
      const stanza = e.payload;
      const parsed = new DOMParser().parseFromString(
        stanza,
        "text/xml"
      ) as XMLDocument;
      const stanzaId = parsed.documentElement.getAttribute("id");

      if (stanzaId === id) {
        unlisten();
        resolve(parsed);
      }
    });
  });
}

export function listenStanza(callback: (stanza: XMLDocument) => void) {
  return (e: Event<StanzaMessage>) => {
    const stanza = e.payload;
    const parsed = new DOMParser().parseFromString(
      stanza,
      "text/xml"
    ) as XMLDocument;
    callback(parsed);
  };
}

export async function getSecret(jid: string): Promise<string | null> {
  try {
    return await invoke("get_secret", { jid });
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function setSecret(jid: string, secret: string) {
  try {
    await invoke("set_secret", { jid, secret });
  } catch (e) {
    console.log(e);
  }
}

// Wait until either connect/disconnect is sent by the server
export async function tryConnect(jid: string, password: string) {
  await connect(jid, password);

  return new Promise<void>(async (resolve, reject) => {
    const unlistenConnect = await listen<ConnectedMessage>("connected", () => {
      unlistenConnect();
      resolve();
    });

    const unlistenDisconnect = await listen<DisconnectedMessage>(
      "disconnected",
      (e) => {
        unlistenDisconnect();
        reject(e.payload);
      }
    );
  });
}

export type ConnectedMessage = string;
export type DisconnectedMessage = string;
export type StanzaMessage = string;

// Dispose events on React unmount
export function useEffectEvent<T>(name: string, handler: EventCallback<T>) {
  React.useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    (async () => {
      unlisten = await listen(name, handler);
    })();

    return () => {
      console.log(unlisten);
      if (unlisten) unlisten();
    };
  }, []);
}

// Dispose events on Vite HMR
export async function useViteEvent<T>(name: string, handler: EventCallback<T>) {
  const unlisten = await listen(name, handler);
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      unlisten();
    });
  }
}
