import { expect } from "chai";

import { createSandbox, createComponent } from "../test_utils";

import AdminLink from "../../src/components/AdminLink";


describe.only("AdminLink component", () => {
  let sandbox;
  let node;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Simple", () => {
    beforeEach(() => {
      node = createComponent(AdminLink, {
        name: "collection:attributes",
        params: {bid: "bid", cid: "cid"},
      });
    });

    it("should render a link", () => {
      expect(node.getAttribute("href")).eql("/buckets/bid/collections/cid/attributes");
    });
  });

  describe("With query parameters", () => {
    beforeEach(() => {
      node = createComponent(AdminLink, {
        name: "collection:attributes",
        params: {bid: "bid", cid: "cid"},
        query: {since: 42}
      });
    });

    it("should render a table", () => {
      expect(node.getAttribute("href")).eql("/buckets/bid/collections/cid/attributes?since=42");
    });
  });
});
