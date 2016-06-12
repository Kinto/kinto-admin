import { install as installGeneratorSupport } from "mocha-generators";
import Nightmare from "nightmare";
import { expect } from "chai";

import {
  start as startStaticTestServer,
  stop as stopStaticTestServer,
} from "../testServer";
import { authenticate } from "./utils";


installGeneratorSupport();

describe("Auth tests", function() {
  this.timeout(50000);

  let browser;

  beforeEach(() => {
    browser = Nightmare({show: !!process.env.NIGHTMARE_SHOW});
    return startStaticTestServer();
  });

  afterEach(() => {
    return Promise.all([
      browser.end(),
      stopStaticTestServer()
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

