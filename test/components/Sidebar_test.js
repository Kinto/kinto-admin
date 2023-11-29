import { renderWithProvider } from "../test_utils";
import { Sidebar } from "../../src/components/Sidebar";
import { clone } from "../../src/utils";
import React from "react";

describe("Sidebar component", () => {
  describe("Not authenticated", () => {
    it("should not render any bucket menus", () => {
      const node = renderWithProvider(
        <Sidebar
          match={{ params: {} }}
          location={{ pathname: "" }}
          capabilities={{ history: {} }}
        />,
        { initialState: { session: { authenticated: false } } }
      );

      expect(node.container.querySelectorAll(".bucket-menu")).toHaveLength(0);
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

    beforeEach(() => {
      node = renderWithProvider(
        <Sidebar
          match={{ params }}
          location={location}
          capabilities={capabilities}
        />,
        { initialState: { session } }
      );
      bucketMenus = node.container.querySelectorAll(".bucket-menu");
    });

    it("should list the user buckets", () => {
      expect(bucketMenus).toHaveLength(2);
    });

    it("should list collections for the first bucket", () => {
      const collMenus = bucketMenus[0].querySelectorAll(
        ".collections-menu-entry"
      );
      // Sorted alphabetically.
      expect([].map.call(collMenus, x => x.textContent)).toStrictEqual([
        "mycoll",
        "othercoll",
      ]);
    });

    it("should list collections for the second bucket", () => {
      const collMenus = bucketMenus[1].querySelectorAll(
        ".collections-menu-entry"
      );

      expect([].map.call(collMenus, x => x.textContent)).toStrictEqual([
        "bar",
        "baz",
        "foo",
      ]);
    });

    it("should highlight the selected collection", () => {
      const targetEntry = bucketMenus[0].querySelectorAll(
        ".collections-menu-entry"
      )[0];

      expect(targetEntry.classList.contains("active")).toBe(true);
    });

    describe("Create bucket", () => {
      it("should be shown by default", () => {
        node = renderWithProvider(
          <Sidebar
            match={{ params }}
            location={location}
            capabilities={capabilities}
          />,
          { initialState: { session } }
        );
        expect(node.container.querySelector(".bucket-create")).toBeDefined();
      });

      it("should be hidden if not allowed", () => {
        const notAllowed = clone(session);
        notAllowed.permissions = [{ resource_name: "root", permissions: [] }];

        node = renderWithProvider(
          <Sidebar
            match={{ params }}
            location={location}
            capabilities={capabilities}
          />,
          { initialState: { session: notAllowed } }
        );
        expect(node.container.querySelector(".bucket-create")).toBeNull();
      });
    });
  });
});
