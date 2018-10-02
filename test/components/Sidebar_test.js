import { expect } from "chai";

import { createSandbox, createComponent } from "../test_utils";
import Sidebar from "../../src/components/Sidebar";
import { clone } from "../../src/utils";

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
        match: { params: {} },
        location: { pathname: "" },
        session: { authenticated: false },
        settings: { sidebarMaxListedCollections: 2 },
        capabilities: { history: {} },
      });

      expect(node.querySelectorAll(".bucket-menu")).to.have.a.lengthOf(0);
    });
  });

  describe("Authenticated", () => {
    let node, bucketMenus;

    const session = {
      authenticated: true,
      serverInfo: {
        user: { bucket: "defaultBucket" },
      },
      buckets: [
        {
          id: "mybuck",
          collections: [{ id: "othercoll" }, { id: "mycoll" }],
        },
        {
          id: "otherbuck",
          collections: [{ id: "foo" }, { id: "bar" }, { id: "baz" }],
        },
      ],
    };

    const params = { bid: "mybuck", cid: "mycoll" };
    const location = { pathname: "" };
    const capabilities = { history: {} };
    const settings = { sidebarMaxListedCollections: 2 };

    beforeEach(() => {
      node = createComponent(Sidebar, {
        match: { params },
        location,
        session,
        settings,
        capabilities,
      });
      bucketMenus = node.querySelectorAll(".bucket-menu");
    });

    it("should list the user buckets", () => {
      expect(bucketMenus).to.have.a.lengthOf(2);
    });

    it("should list collections for the first bucket", () => {
      const collMenus = bucketMenus[0].querySelectorAll(
        ".collections-menu-entry"
      );

      expect([].map.call(collMenus, x => x.textContent)).eql([
        "othercoll",
        "mycoll",
      ]);
    });

    it("should list collections for the second bucket", () => {
      const collMenus = bucketMenus[1].querySelectorAll(
        ".collections-menu-entry"
      );

      // Note: collections are sliced to 2 items because of the
      // sidebarMaxListedCollections setting
      expect([].map.call(collMenus, x => x.textContent)).eql(["foo", "bar"]);
    });

    it("should highlight the selected collection", () => {
      const targetEntry = bucketMenus[0].querySelectorAll(
        ".collections-menu-entry"
      )[1];

      expect(targetEntry.classList.contains("active")).eql(true);
    });

    describe("Create bucket", () => {
      it("should be shown by default", () => {
        node = createComponent(Sidebar, {
          match: { params },
          location,
          session,
          settings,
          capabilities,
        });
        expect(node.querySelector(".bucket-create")).to.exist;
      });

      it("should be hidden if not allowed", () => {
        const notAllowed = clone(session);
        notAllowed.permissions = [{ resource_name: "root", permissions: [] }];

        node = createComponent(Sidebar, {
          match: { params },
          location,
          session: notAllowed,
          settings,
          capabilities,
        });
        expect(node.querySelector(".bucket-create")).to.not.exist;
      });
    });
  });
});
