/* @flow */

import type { AuthData } from "./types";

import KintoClient from "kinto-http";


let client: ?KintoClient;

function getAuthHeader(auth: AuthData): ?string {
  switch(auth.authType) {
    case "fxa": {
      const {token}: {token: string} = auth.credentials;
      return "Bearer " + token;
    }
    case "anonymous": {
      return undefined;
    }
    // case "ldap": {
    // case "basicauth":
    default: {
      const {username, password}: {
        username: string,
        password: string,
      } = auth.credentials;
      return "Basic " + btoa([username, password].join(":"));
    }
  }
}

export function setupClient(session: AuthData): KintoClient {
  const {server}: {server: string} = session;
  return setClient(new KintoClient(server, {
    headers: {Authorization: getAuthHeader(session)}
  }));
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
