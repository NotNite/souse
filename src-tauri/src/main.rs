#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures::stream::StreamExt;
use futures_util::{FutureExt, SinkExt};
use keyring::Entry;
use serde::Serialize;
use std::str::FromStr;
use tauri::{async_runtime::Mutex, Manager};
use thiserror::Error;
use tokio_xmpp::{AsyncClient, AsyncConfig, AsyncServerConfig, Event};
use xmpp_parsers::{Element, Jid};

#[derive(Error, Debug, Serialize, Clone)]
pub enum Error {
    #[error("failed to parse JID")]
    ParseJid,
    #[error("failed to parse stanza")]
    ParseStanza {
        clientbound: bool,
        stanza: Option<String>,
    },

    #[error("failed to interact with service provider")]
    ServiceProvider,

    #[error("failed to send message to session")]
    SendSession,
    #[error("failed to disconnect session")]
    DisconnectSession,
    #[error("not connected")]
    NotConnected,

    #[error("auth fail")]
    AuthFail(String),

    #[error("unknown connection error")]
    Unknown(String),
    #[error("unknown authentication error")]
    UnknownAuth(String),
}
pub type SouseResult<T> = Result<T, Error>;

#[derive(Debug)]
enum XMPPMessage {
    Send(String),
    Close,
}

struct SouseState {
    xmpp_tx: Option<tauri::async_runtime::Sender<XMPPMessage>>,
}

struct WrappedSouseState(Mutex<SouseState>);

fn element_to_string(element: Element) -> Option<String> {
    let mut writer = Vec::new();
    element.write_to(&mut writer).ok();
    String::from_utf8(writer).ok()
}

fn format_error(error: tokio_xmpp::Error) -> Error {
    match error {
        tokio_xmpp::Error::Disconnected => Error::AuthFail("unknown-disconnected".to_string()),
        tokio_xmpp::Error::Auth(auth) => match auth {
            tokio_xmpp::AuthError::Fail(fail) => {
                let element: Element = fail.into();
                Error::AuthFail(element.name().to_string())
            }
            _ => Error::UnknownAuth(auth.to_string()),
        },
        _ => Error::Unknown(error.to_string()),
    }
}

#[tauri::command]
async fn connect(
    app: tauri::AppHandle,
    state: tauri::State<'_, WrappedSouseState>,
    jid: String,
    password: String,
) -> SouseResult<()> {
    let (tx, mut rx) = tauri::async_runtime::channel::<XMPPMessage>(1);
    let mut state = state.0.lock().await;
    if let Some(old_tx) = &state.xmpp_tx {
        // We can't set old_tx to None because of lifetimes (lol), so just don't care if it doesn't get sent
        old_tx.send(XMPPMessage::Close).await.ok();
    }
    state.xmpp_tx = Some(tx);

    let jid = Jid::from_str(&jid).map_err(|_| Error::ParseJid)?;
    if jid.clone().node().is_none() {
        return Err(Error::ParseJid);
    }

    let config = AsyncConfig {
        jid,
        password,
        server: AsyncServerConfig::UseSrv,
    };

    tauri::async_runtime::spawn(async move {
        let mut client = AsyncClient::new_with_config(config);

        let rx_stream = async_stream::stream! {
            while let Some(item) = rx.recv().await {
                yield item;
            }
        };
        let mut rx_pinned = Box::pin(rx_stream);

        loop {
            futures_util::select! {
                xmpp_message = client.next().fuse() => {
                    match xmpp_message {
                        Some(Event::Online { bound_jid, .. }) => {
                            app.emit_all("connected", bound_jid.to_string()).ok();
                        },
                        Some(Event::Disconnected(error)) => {
                            app.emit_all("disconnected", format_error(error)).ok();
                            break;
                        },
                        Some(Event::Stanza(stanza)) => {
                            if let Some(string) = element_to_string(stanza) {
                                println!("{}", string);
                                app.emit_all("stanza", string).ok();
                            } else {
                                app.emit_all("failed_parse_stanza", Error::ParseStanza {
                                    clientbound: true,
                                    stanza: None
                                }).ok();
                            }
                        },
                        _ => {}
                    }
                },
                rx_message = rx_pinned.next().fuse() => {
                    match rx_message {
                        Some(XMPPMessage::Send(stanza)) => {
                            println!("{}", stanza);
                            if let Ok(e) = Element::from_str(&stanza) {
                                client.send_stanza(e).await.ok();
                            } else {
                                app.emit_all("failed_parse_stanza", Error::ParseStanza {
                                    clientbound: false,
                                    stanza: Some(stanza)
                                }).ok();
                            }
                        },
                        Some(XMPPMessage::Close) => {
                            client.close().await.ok();
                            app.emit_all("disconnected", ()).ok();
                            break;
                        },
                        _ => {}
                    }
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn send(state: tauri::State<'_, WrappedSouseState>, stanza: String) -> SouseResult<()> {
    let state = state.0.lock().await;

    if let Some(tx) = &state.xmpp_tx {
        tx.send(XMPPMessage::Send(stanza))
            .await
            .map_err(|_| Error::SendSession)?;
        Ok(())
    } else {
        Err(Error::NotConnected)
    }
}

#[tauri::command]
async fn disconnect(state: tauri::State<'_, WrappedSouseState>) -> SouseResult<()> {
    let state = state.0.lock().await;

    if let Some(tx) = &state.xmpp_tx {
        tx.send(XMPPMessage::Close)
            .await
            .map_err(|_| Error::DisconnectSession)?;
    } else {
        return Err(Error::NotConnected);
    }

    Ok(())
}

#[tauri::command]
async fn get_secret(jid: String) -> SouseResult<Option<String>> {
    let entry = Entry::new("souse", &jid).map_err(|_| Error::ServiceProvider)?;
    Ok(entry.get_password().ok())
}

#[tauri::command]
async fn set_secret(jid: String, secret: String) -> SouseResult<()> {
    let entry = Entry::new("souse", &jid).map_err(|_| Error::ServiceProvider)?;
    entry
        .set_password(&secret)
        .map_err(|_| Error::ServiceProvider)?;
    Ok(())
}

fn main() {
    let state = SouseState { xmpp_tx: None };

    tauri::Builder::default()
        .manage(WrappedSouseState(Mutex::new(state)))
        .invoke_handler(tauri::generate_handler![
            connect, send, disconnect, get_secret, set_secret
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
