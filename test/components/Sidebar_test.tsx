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
      collections: [
        { id: "othercoll", last_edit_date: "2024-01-16T13:48:19.630374+00:00" },
        { id: "mycoll", last_edit_date: "2026-06-04T16:19:20.830713+00:00" },
      ],
    },
    {
      id: "otherbuck",
      collections: [
        { id: "foo", last_edit_date: "2024-01-16T13:48:19.630374+00:00" },
        { id: "bar", last_edit_date: "2025-08-01T10:39:52.247351+00:00" },
        { id: "baz", last_edit_date: "2026-06-04T16:19:20.830713+00:00" },
        { id: "a", last_modified: 1789430450812 },
        { id: "z", last_modified: 1789430451046 },
      ],
    },
  ];

  beforeEach(() => {
    vi.spyOn(bucketHooks, "useBucketsCollectionsList").mockReturnValue(buckets);
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
      // Sorted by last_edit_date descending.
      expect([].map.call(collMenus, x => x.textContent)).toStrictEqual([
        "mycoll",
        "othercoll",
      ]);
    });

    it("should list collections for the second bucket in the correct order", () => {
      const collMenus = bucketMenus[1].querySelectorAll(
        ".collections-menu-entry"
      );

      // Sorted by last_edit_date descending, and then last_modified.
      expect([].map.call(collMenus, x => x.textContent)).toStrictEqual([
        "baz",
        "bar",
        "foo",
        "z",
        "a",
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
      vi.spyOn(bucketHooks, "useBucketsCollectionsList").mockReturnValueOnce(
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
