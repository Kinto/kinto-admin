import KintoServer from "kinto-node-test-server";

import staticServer from "../testServer";


let kintoServer;

export function startServers() {
  kintoServer = new KintoServer("http://0.0.0.0:8888/v1");
  return Promise.all([
    kintoServer.start(),
    staticServer.start(),
  ]);
}

export function stopServers() {
  for (const line of kintoServer.logs) {
    console.log(line.toString());
  }
  return Promise.all([
    kintoServer.killAll(),
    staticServer.stop(),
  ]);
}

export function authenticate(browser, username, password) {
  return browser
    .goto("http://localhost:3000/")
    .wait(".rjsf")
    .type("#root_server", "")
    .type("#root_server", "http://0.0.0.0:8888/v1")
    .type("#root_credentials_username", "")
    .type("#root_credentials_username", username)
    .type("#root_credentials_password", "")
    .type("#root_credentials_password", password)
    .click(".rjsf button[type=submit]")
    .wait(".session-info-bar");
}
