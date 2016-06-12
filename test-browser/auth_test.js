import { install as installGeneratorSupport } from "mocha-generators";
import Nightmare from "nightmare";
import KintoServer from "kinto-node-test-server";
import { expect } from "chai";

import {
  start as startStaticTestServer,
  stop as stopStaticTestServer,
} from "../testServer";
import { authenticate } from "./utils";


installGeneratorSupport();

describe("Auth tests", function() {
  this.timeout(50000);

  let browser, kintoTestServer;

  beforeEach(() => {
    kintoTestServer = new KintoServer("http://0.0.0.0:8888/v1", {
      kintoConfigPath: __dirname + "/kinto.ini",
      pservePath: __dirname + "/../.venv/bin/pserve",
    });
    browser = Nightmare({show: !!process.env.NIGHTMARE_SHOW});
    return Promise.all([
      kintoTestServer.start(),
      startStaticTestServer(),
    ]);
  });

  afterEach(() => {
    for (const line of kintoTestServer.logs) {
      console.log(line.toString());
    }
    return Promise.all([
      kintoTestServer.killAll(),
      browser.end(),
      stopStaticTestServer(),
    ]);
  });

  it("should authenticate a user", function* () {
    const result = yield authenticate(browser, "__user__", "__pass__")
      .evaluate(() => {
        return document.querySelector(".session-info-bar strong").textContent;
      })
      .end();

    expect(result).eql("__user__");
  });

  it("should log a user out", function* () {
    yield authenticate(browser, "__user__", "__pass__")
      .click(".session-info-bar .btn-logout")
      .wait(".notification.alert-success")
      .evaluate(() => {
        return document.querySelector(".session-info-bar");
      })
      .then(res => {
        expect(res).to.be.null;
      });
  });
});

