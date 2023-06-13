// This file is garbage lmfao

export enum ErrorEnum {
  ParseJid = "ParseJid",
  ParseStanza = "ParseStanza",

  ServiceProvider = "ServiceProvider",

  SendSession = "SendSession",
  DisconnectSession = "DisconnectSession",
  NotConnected = "NotConnected",

  AuthFail = "AuthFail",

  Unknown = "Unknown",
  UnknownAuth = "UnknownAuth",

  Unparseable = "Unparseable"
}

type ParseStanza = {
  clientbound: boolean;
  stanza: string | null;
};
type AuthFail = string;
type Unknown = string;
type UnknownAuth = string;

export type DetailedError = {
  ParseStanza?: ParseStanza;
  AuthFail?: AuthFail;
  Unknown?: Unknown;
  UnknownAuth?: UnknownAuth;
};

export type ParseErrorResult =
  | [ErrorEnum.ParseStanza, ParseStanza]
  | [ErrorEnum.AuthFail, AuthFail]
  | [ErrorEnum.Unknown, Unknown]
  | [ErrorEnum.UnknownAuth, UnknownAuth]
  | [ErrorEnum, null];

export type SouseError = ErrorEnum | DetailedError;

export function parseError(error: SouseError): ParseErrorResult {
  if (typeof error === "string") {
    return [error, null];
  } else {
    if (error.ParseStanza != null)
      return [ErrorEnum.ParseStanza, error.ParseStanza];
    if (error.AuthFail != null) return [ErrorEnum.AuthFail, error.AuthFail];
    if (error.Unknown != null) return [ErrorEnum.Unknown, error.Unknown];
    if (error.UnknownAuth != null)
      return [ErrorEnum.UnknownAuth, error.UnknownAuth];
  }

  console.warn("Failed to parse error", error);
  return [ErrorEnum.Unparseable, null];
}
