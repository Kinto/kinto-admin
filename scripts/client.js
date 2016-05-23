import KintoClient from "kinto-client";


let client;

// {
//   server: "http://server/v1",
//   credentials: {
//     authType: "basicauth",
//     username: "user",
//     password: "pass"
//   }
// }

// {
//   server: "http://server/v1",
//   credentials: {
//     authType: "fxa",
//     token: "grotoken"
//   }
// }

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
