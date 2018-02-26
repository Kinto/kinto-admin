import { install as installGeneratorSupport } from "mocha-generators";
import { expect } from "chai";

import {
  startServers,
  stopServers,
  createBrowser,
  createClient,
  authenticate,
  createCollection,
} from "./utils";

installGeneratorSupport();

describe("Collection tests", function() {
  this.timeout(60000);

  let browser, client;

  beforeEach(function*() {
    browser = createBrowser();
    yield startServers();
    yield authenticate(browser, "__test__", "__pass__");
    client = createClient("__test__", "__pass__");
  });

  afterEach(function*() {
    yield browser.end();
    yield stopServers();
  });

  it("should create a collection", function*() {
    const result = yield createCollection(browser, "MyBucket", "MyCollection")
      .wait(".collections-menu-entry")
      .evaluate(() => {
        return document.querySelector(".collections-menu-entry").textContent;
      })
      .end();
    expect(result).eql("MyCollection");

    const { data } = yield client.bucket("MyBucket").listCollections();
    expect(data).to.have.length.of(1);
    expect(data[0].id).eql("MyCollection");
  });

  it("should update a collection", function*() {
    const result = yield createCollection(browser, "MyBucket", "MyCollection")
      .click("[href='#/buckets/MyBucket/collections/MyCollection/attributes']")
      .wait(".rjsf")
      .evaluate(() => {
        return document.querySelector(".rjsf input[type=submit]").value;
      })
      .end();

    expect(result).eql("Update collection");
  });

  it("should delete a collection", function*() {
    const result = yield createCollection(browser, "MyBucket", "MyCollection")
      .evaluate(() => {
        // Force accepting confirmation prompt
        window.confirm = () => true;
      })
      .click("[href='#/buckets/MyBucket/collections/MyCollection/attributes']")
      .wait(".rjsf")
      .type(".panel-danger #root", "MyCollection")
      .click(".panel-danger button[type=submit]")
      .wait(".notification.alert-success")
      .evaluate(() => {
        return document.querySelectorAll(".collections-menu-entry").length;
      })
      .end();
    expect(result).eql(0);

    const { data } = yield client.bucket("MyBucket").listCollections();
    expect(data).to.have.length.of(0);
  });
});
