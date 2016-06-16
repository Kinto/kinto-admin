/* @flow */

import type { AuthData } from "./types";

import KintoClient from "kinto-http";
import endpoint from "kinto-http/lib/endpoint";
import { isHTTPok } from "./utils";


let client: ?KintoClient;

function getAuthHeader(auth: AuthData): ?string {
  switch(auth.authType) {
    case "fxa": {
      const {token}: {token: string} = auth.credentials;
      return "Bearer " + token;
    }
    case "basicauth": {
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

// XXX this should eventually move to kinto-http
export function requestAttachment(
  bid: string,
  cid: string,
  rid: string,
  params: Object
): Promise {
  const client: KintoClient = getClient();
  if (!client) {
    throw new Error("Client is not configured.");
  }
  const {remote, defaultReqOptions}: {
    remote: string,
    defaultReqOptions: {
      headers: Object
    }
  } = client;
  const path = endpoint("record", bid, cid, rid) + "/attachment";
  return fetch(remote + path, {
    headers: defaultReqOptions.headers,
    ...params
  })
    .then(({status}) => {
      if (!isHTTPok(status)) {
        throw new Error("HTTP ${status}");
      }
    })
    .catch(({message}) => {
      const {method} = params;
      throw new Error(`Unable to ${method} attachment: ${message}`);
    });
}
