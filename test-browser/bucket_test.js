import { install as installGeneratorSupport } from "mocha-generators";
import { expect } from "chai";

import {
  startServers,
  stopServers,
  createBrowser,
  authenticate,
  createBucket,
} from "./utils";


installGeneratorSupport();

describe("Bucket tests", function() {
  this.timeout(10000);

  let browser;

  beforeEach(function* () {
    browser = createBrowser();
    yield startServers();
    yield authenticate(browser, "__test__", "__pass__");
  });

  afterEach(function* () {
    yield browser.end();
    yield stopServers();
  });

  it("should create a bucket", function* () {
    const result = yield createBucket(browser, "MyBucket")
      .evaluate(() => {
        return document.querySelector(".bucket-menu .panel-heading strong").textContent;
      })
      .end();

    expect(result).eql("MyBucket");
  });

  it("should edit a bucket", function* () {
    const result = yield createBucket(browser, "MyBucket")
      .click("[href='#/buckets/MyBucket/edit']")
      .wait(".rjsf")
      .evaluate(() => {
        return document.querySelector(".rjsf input[type=submit]").value;
      })
      .end();

    expect(result).eql("Update bucket");
  });

  it("should delete a bucket", function* () {
    const result = yield createBucket(browser, "MyBucket")
      .evaluate(() => {
        // Force accepting confirmation prompt
        window.confirm = () => true;
      })
      .click("[href='#/buckets/MyBucket/edit']")
      .wait(".rjsf")
      .type(".panel-danger #root", "MyBucket")
      .click(".panel-danger button[type=submit]")
      .wait(".notification.alert-success")
      .evaluate(() => {
        return document.querySelectorAll(".bucket-menu").length;
      })
      .end();

    expect(result).eql(0);
  });
});

