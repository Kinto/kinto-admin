/* @flow */

import KintoClient from "kinto-client";
import endpoint from "kinto-client/lib/endpoint";
import { isHTTPok } from "./utils";


let client: any; // maybe null|KintoClient

function getAuthHeader(session: Object) {
  const {authType, credentials} = session;
  switch(authType) {
    case "fxa": {
      const {token} = credentials;
      return "Bearer " + token;
    }
    case "basicauth": {
      const {username, password} = credentials;
      return "Basic " + btoa([username, password].join(":"));
    }
  }
}

export function setupClient(session: Object) {
  const {server} = session;
  return setClient(new KintoClient(server, {
    headers: {Authorization: getAuthHeader(session)}
  }));
}

export function getClient(): KintoClient {
  return client;
}

export function setClient(_client: KintoClient) {
  client = _client;
  return client;
}

export function resetClient() {
  client = null;
}

// XXX this should eventually move to kinto-client
export function requestAttachment(
  bid: string,
  cid: string,
  rid: string,
  params: Object
) {
  const {remote, defaultReqOptions} = getClient();
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
      throw {
        ...new Error(`Unable to ${method} attachment: ${message}`),
        details: [
          "URL: " + remote + path,
          "Status: HTTP " + status,
        ]
      };
    });
}
