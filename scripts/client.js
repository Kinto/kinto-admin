import KintoClient from "kinto-client";
import endpoint from "kinto-client/lib/endpoint";
import { isHTTPok } from "./utils";


let client;

function getAuthHeader(session) {
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

export function setupClient(session) {
  const {server} = session;
  return setClient(new KintoClient(server, {
    headers: {Authorization: getAuthHeader(session)}
  }));
}

export function getClient() {
  return client;
}

export function setClient(_client) {
  client = _client;
  return client;
}

export function resetClient() {
  client = null;
}

// XXX this should eventually move to kinto-client
export function requestAttachment(bid, cid, rid, params) {
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
      const err = new Error(`Unable to ${method} attachment: ${message}`);
      err.details = [
        "URL: " + remote + path,
        "Status: HTTP " + status,
      ];
      throw err;
    });
}
