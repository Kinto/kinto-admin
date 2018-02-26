import { install as installGeneratorSupport } from "mocha-generators";
import { expect } from "chai";

import {
  startServers,
  stopServers,
  createBrowser,
  createClient,
  authenticate,
  createBucket,
} from "./utils";

installGeneratorSupport();

describe("Bucket tests", function() {
  this.timeout(60000);

  let browser, client;

  beforeEach(function*() {
    client = createClient("__test__", "__pass__");
    browser = createBrowser();
    yield startServers();
    yield authenticate(browser, "__test__", "__pass__");
  });

  afterEach(function*() {
    yield browser.end();
    yield stopServers();
  });

  it("should create a bucket", function*() {
    const result = yield createBucket(browser, "MyBucket")
      .evaluate(() => {
        return document.querySelector(".bucket-menu .panel-heading strong")
          .textContent;
      })
      .end();
    expect(result).eql("MyBucket");

    const { data } = yield client.listBuckets();
    expect(data).to.have.length.of(1);
    expect(data[0].id).eql("MyBucket");
  });

  it("should edit a bucket", function*() {
    const result = yield createBucket(browser, "MyBucket")
      .click("[href='#/buckets/MyBucket/attributes']")
      .wait(".rjsf")
      .evaluate(() => {
        return document.querySelector(".rjsf input[type=submit]").value;
      })
      .end();

    expect(result).eql("Update bucket");
  });

  it("should delete a bucket", function*() {
    const result = yield createBucket(browser, "MyBucket")
      .evaluate(() => {
        // Force accepting confirmation prompt
        window.confirm = () => true;
      })
      .click("[href='#/buckets/MyBucket/attributes']")
      .wait(".panel-danger")
      .type(".panel-danger #root", "MyBucket")
      .click(".panel-danger button[type=submit]")
      .wait(".notification.alert-success")
      .evaluate(() => {
        return document.querySelectorAll(".bucket-menu").length;
      })
      .end();
    expect(result).eql(0);

    const { data } = yield client.listBuckets();
    expect(data).to.have.length.of(0);
  });
});
