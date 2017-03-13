/* @flow */

import type { AuthData } from "./types";

import KintoClient from "kinto-http";

let client: ?KintoClient;

function getAuthHeader(auth: AuthData): ?string {
  switch (auth.authType) {
    case "fxa": {
      const { token }: { token: string } = auth.credentials;
      return "Bearer " + token;
    }
    case "portier": {
      const { token }: { token: string } = auth.credentials;
      return "Portier " + token;
    }
    case "anonymous": {
      return undefined;
    }
    case "ldap":
    case "basicauth":
    default: {
      const { username, password } = auth.credentials;
      return "Basic " + btoa([username, password].join(":"));
    }
  }
}

export function setupClient(auth: AuthData): KintoClient {
  const { server }: { server: string } = auth;
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
