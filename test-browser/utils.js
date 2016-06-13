import Nightmare from "nightmare";
import KintoServer from "kinto-node-test-server";

import staticServer from "../testServer";


let kintoServer;

export function startServers() {
  kintoServer = new KintoServer("http://0.0.0.0:8888/v1", {
    pservePath: ".venv/bin/pserve"
  });
  return Promise.all([
    kintoServer.start(),
    staticServer.start(),
  ]).then(new Promise(r => setTimeout(r, 200)));
}

export function stopServers() {
  for (const line of kintoServer.logs) {
    console.log(line.toString());
  }
  return Promise.all([
    kintoServer.killAll(),
    staticServer.stop(),
  ]).then(new Promise(r => setTimeout(r, 200)));
}

export function createBrowser() {
  return Nightmare({
    waitTimeout: 60000,
    show: !!process.env.NIGHTMARE_SHOW,
    openDevTools: true,
    width: 1600,
    height: 1024,
    center: true,
    alwaysOnTop: false,
    skipTaskbar: true,
  });
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

export function createBucket(browser, bucket) {
  return browser.click("[href='#/buckets/create-bucket']")
    .wait(".rjsf")
    .type("#root_name", bucket)
    .click(".rjsf input[type=submit]")
    .wait(".notification.alert-success")
    .wait(`[href='#/buckets/${bucket}/edit']`);
}

export function createCollection(browser, bucket, collection) {
  return createBucket(browser, bucket)
    .click(`[href='#/buckets/${bucket}/create-collection']`)
    .wait(".rjsf")
    .type("#root_name", collection)
    .click(".rjsf input[type=submit]")
    .wait(".notification.alert-success")
    .wait(`[href='#/buckets/${bucket}/collections/${collection}/edit']`);
}
