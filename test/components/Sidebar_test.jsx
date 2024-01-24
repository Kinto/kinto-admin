import { renderWithProvider } from "../testUtils";
import { Sidebar } from "../../src/components/Sidebar";
import { clone } from "../../src/utils";
import React from "react";
import { screen } from "@testing-library/react";

describe("Sidebar component", () => {
  const params = { bid: "mybuck", cid: "mycoll" };
  const location = { pathname: "" };
  const capabilities = { history: {} };
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

  describe("Not authenticated", () => {
    it("should not render any bucket menus", () => {
      renderWithProvider(
        <Sidebar
          match={{ params: {} }}
          location={{ pathname: "" }}
          capabilities={{ history: {} }}
        />,
        { initialState: { session: { authenticated: false } } }
      );

      expect(screen.queryByTestId("sidebar-bucketMenu")).toBeNull();
    });
  });

  describe("Authenticated", () => {
    let bucketMenus;

    beforeEach(() => {
      renderWithProvider(
        <Sidebar
          match={{ params }}
          location={location}
          capabilities={capabilities}
        />,
        { initialState: { session } }
      );
      bucketMenus = screen.getAllByTestId("sidebar-bucketMenu");
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
  });

  describe("Create bucket", () => {
    it("should be shown by default", () => {
      renderWithProvider(
        <Sidebar
          match={{ params }}
          location={location}
          capabilities={capabilities}
        />,
        { initialState: { session } }
      );
      expect(screen.queryAllByText("Create bucket")).toHaveLength(1);
    });

    it("should be hidden if not allowed", () => {
      const notAllowed = clone(session);
      notAllowed.permissions = [{ resource_name: "root", permissions: [] }];

      renderWithProvider(
        <Sidebar
          match={{ params }}
          location={location}
          capabilities={capabilities}
        />,
        { initialState: { session: notAllowed } }
      );
      expect(screen.queryAllByText("Create bucket")).toHaveLength(0);
    });
  });
});
