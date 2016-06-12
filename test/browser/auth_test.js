import { install as installGeneratorSupport } from "mocha-generators";
import Nightmare from "nightmare";
import { expect } from "chai";

import {
  start as startStaticTestServer,
  stop as stopStaticTestServer,
} from "../../testServer";

installGeneratorSupport();


describe("Auth tests", function() {
  this.timeout(20000);

  let browser;

  beforeEach(() => {
    browser = Nightmare({show: false});
    return startStaticTestServer();
  });

  afterEach(() => {
    return stopStaticTestServer();
  });

  it("should open the homepage", function* () {
    const result = yield browser
      .goto("http://localhost:3000/")
      .wait(".rjsf")
      .type("#root_credentials_username", "")
      .type("#root_credentials_username", "__test__")
      .type("#root_credentials_password", "")
      .type("#root_credentials_password", "__test__")
      .click(".rjsf button.btn.btn-info")
      .wait(".session-info-bar")
      .evaluate(() => {
        return document.querySelector(".session-info-bar strong").textContent;
      })
      .end();

    expect(result).eql("__test__");
  });
});

