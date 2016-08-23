import { expect } from "chai";

import { createSandbox, createComponent } from "../test_utils";
import Sidebar from "../../scripts/components/Sidebar";


describe("Sidebar component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Not authenticated", () => {
    it("should not render any bucket menus", () => {
      const node = createComponent(Sidebar, {
        params: {},
        location: {pathname: ""},
        session: {authenticated: false},
      });

      expect(node.querySelectorAll(".bucket-menu")).to.have.length.of(0);
    });
  });

  describe("Authenticated", () => {
    let node, bucketMenus;

    const session = {
      authenticated: true,
      serverInfo: {
        user: {bucket: "defaultBucket"}
      },
      buckets: [
        {
          id: "mybuck",
          collections: [{id: "othercoll"}, {id: "mycoll"}]
        },
        {
          id: "otherbuck",
          collections: [{id: "foo"}, {id: "bar"}, {id: "baz"}]
        }
      ]
    };

    beforeEach(() => {
      const params = {bid: "mybuck", cid: "mycoll"};
      const location = {pathname: ""};

      node = createComponent(Sidebar, {params, location, session});
      bucketMenus = node.querySelectorAll(".bucket-menu");
    });

    it("should list the user buckets", () => {
      expect(bucketMenus).to.have.length.of(2);
    });

    it("should list collections for the first bucket", () => {
      const collMenus = bucketMenus[0].querySelectorAll(".collections-menu-entry > a");

      expect([].map.call(collMenus, x => x.textContent))
        .eql(["othercoll", "mycoll"]);
    });

    it("should list collections for the second bucket", () => {
      const collMenus = bucketMenus[1].querySelectorAll(".collections-menu-entry > a");

      expect([].map.call(collMenus, x => x.textContent))
        .eql(["foo", "bar", "baz"]);
    });

    it("should highlight the selected collection", () => {
      const targetEntry = bucketMenus[0]
        .querySelectorAll(".collections-menu-entry")[1];

      expect(targetEntry.classList.contains("active"))
        .eql(true);
    });
  });
});
