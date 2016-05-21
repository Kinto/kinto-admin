import KintoClient from "kinto-client";


let client;

export function setupClient({server, username, password}) {
  client = new KintoClient(server, {
    headers: {
      Authorization: "Basic " + btoa([username, password].join(":")),
    }
  });
}

export function getClient() {
  return client;
}

export function resetClient() {
  client = null;
}
