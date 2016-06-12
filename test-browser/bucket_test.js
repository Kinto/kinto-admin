import { install as installGeneratorSupport } from "mocha-generators";
import Nightmare from "nightmare";
import { expect } from "chai";

import { startServers, stopServers, authenticate } from "./utils";


installGeneratorSupport();

describe("Bucket tests", function() {
  this.timeout(50000);

  let browser;

  beforeEach(function* () {
    browser = Nightmare({show: !!process.env.NIGHTMARE_SHOW});
    yield startServers();
    yield authenticate(browser, "__test__", "__pass__");
  });

  afterEach(function* () {
    yield browser.end();
    yield stopServers();
  });

  it("should create a bucket", function* () {
    const result = yield browser.click("[href='#/buckets/create-bucket']")
      .wait(".rjsf")
      .type("#root_name", "MyBucket")
      .click(".rjsf input[type=submit]")
      .wait(".notification.alert-success")
      .evaluate(() => {
        return document.querySelector(".bucket-menu .panel-heading strong").textContent;
      })
      .end();

    expect(result).eql("MyBucket");
  });
});

