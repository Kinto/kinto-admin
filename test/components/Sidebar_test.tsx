import { Sidebar } from "@src/components/Sidebar";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as bucketHooks from "@src/hooks/bucket";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

describe("Sidebar component", () => {
  const routeProps = {
    route: "/mybuck/mycoll",
    path: "/:bid/:cid",
  };

  const buckets = [
    {
      id: "mybuck",
      collections: [{ id: "othercoll" }, { id: "mycoll" }],
    },
    {
      id: "otherbuck",
      collections: [{ id: "foo" }, { id: "bar" }, { id: "baz" }],
    },
  ];

  beforeEach(() => {
    vi.spyOn(bucketHooks, "useBucketList").mockReturnValue(buckets);
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(DEFAULT_SERVERINFO);
    vi.spyOn(sessionHooks, "usePermissions").mockReturnValue([]);
    vi.spyOn(sessionHooks, "useAuth").mockReturnValue({});
  });

  describe("Not authenticated", () => {
    it("should not render any bucket menus", () => {
      vi.spyOn(sessionHooks, "useAuth").mockReturnValue(undefined);
      renderWithRouter(<Sidebar />, {
        ...routeProps,
      });

      expect(screen.queryByTestId("sidebar-bucketMenu")).toBeNull();
    });
  });

  describe("Authenticated", () => {
    let bucketMenus;

    beforeEach(() => {
      renderWithRouter(<Sidebar />, {
        ...routeProps,
      });
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

  describe("Read only collections", () => {
    let bucketMenus;

    beforeEach(() => {
      vi.spyOn(bucketHooks, "useBucketList").mockReturnValueOnce(
        buckets.map(b => {
          return {
            ...b,
            collections: b.collections.map(c => {
              return {
                ...c,
                readonly: true,
              };
            }),
          };
        })
      );
      renderWithRouter(<Sidebar />, {
        ...routeProps,
      });
      bucketMenus = screen.getAllByTestId("sidebar-bucketMenu");
    });

    it("should highlight the selected collection even if it's read-only and we haven't enabled show read-only collections", () => {
      const targetEntry = bucketMenus[0].querySelectorAll(
        ".collections-menu-entry"
      )[0];

      expect(targetEntry.classList.contains("active")).toBe(true);
      expect(screen.getByTestId("sidebar-menuEntry")).toBeDefined(); // should only have 1 menu entry for the current read-only collection
    });
  });

  describe("Create bucket", () => {
    it("should be shown by default", () => {
      vi.spyOn(sessionHooks, "usePermissions").mockReturnValue(undefined);
      renderWithRouter(<Sidebar />, {
        ...routeProps,
      });
      expect(screen.queryAllByText("Create bucket")).toHaveLength(1);
    });

    it("should be hidden if not allowed", () => {
      vi.spyOn(sessionHooks, "usePermissions").mockReturnValue([
        { resource_name: "root", permissions: [] },
      ]);

      renderWithRouter(<Sidebar />, {
        ...routeProps,
      });
      expect(screen.queryAllByText("Create bucket")).toHaveLength(0);
    });
  });
});
