import type { AuthData, CredentialsAuth, OpenIDAuth } from "@src/types";
import { KintoClient } from "kinto";

let client: KintoClient;

export function getAuthHeader(auth: AuthData): string | undefined {
  switch (auth.authType) {
    case "openid": {
      const { tokenType, credentials } = auth as OpenIDAuth;
      const { token } = credentials;
      return `${tokenType} ${token}`;
    }
    case "anonymous": {
      return undefined;
    }
    case "ldap":
    case "basicauth":
    case "accounts":
    default: {
      if (!("credentials" in auth)) {
        return undefined;
      }
      const { username, password } = (auth as CredentialsAuth).credentials;
      return "Basic " + btoa([username, password].join(":"));
    }
  }
}

export function setupClient(auth: AuthData): KintoClient {
  const { server } = auth;
  return setClient(
    new KintoClient(server, {
      headers: { Authorization: getAuthHeader(auth) },
      timeout: 30000,
      retry: 1,
    })
  );
}

export function getClient(): KintoClient {
  if (!client) {
    throw new Error("Client not configured.");
  }
  return client;
}

export function setClient(_client: KintoClient): KintoClient {
  client = _client;
  return client;
}

export function resetClient(): void {
  client = null;
}
