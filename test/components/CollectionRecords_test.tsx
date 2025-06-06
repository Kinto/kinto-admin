import CollectionRecords from "@src/components/collection/CollectionRecords";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as collectionHooks from "@src/hooks/collection";
import * as recordHooks from "@src/hooks/record";
import * as sessionHooks from "@src/hooks/session";
import {
  canCreateRecord,
  canEditCollection,
  canEditRecord,
} from "@src/permission";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("@src/permission", () => {
  return {
    __esModule: true,
    canCreateRecord: vi.fn(),
    canEditRecord: vi.fn(),
    canEditCollection: vi.fn(),
  };
});

describe("CollectionRecords component", () => {
  const routeProps = {
    route: "/bucket/collection",
    path: "/:bid/:cid",
    initialState: {
      session: {
        serverInfo: {
          capabilities: {
            history: {},
          },
        },
      },
    },
  };

  const useRecordList = vi.fn();

  beforeEach(() => {
    canCreateRecord.mockReturnValue(true);
    canEditRecord.mockReturnValue(true);
    canEditCollection.mockReturnValue(true);
    vi.spyOn(recordHooks, "useRecordList").mockImplementation(useRecordList);
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(DEFAULT_SERVERINFO);
  });

  describe("Schema defined", () => {
    beforeEach(() => {
      vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
        id: "collection",
        schema: {
          type: "object",
          properties: {
            foo: { type: "string" },
          },
        },
        displayFields: ["foo"],
      });
      useRecordList.mockReturnValue({
        data: [
          { id: "id1", foo: "bar", last_modified: 2 },
          { id: "id2", foo: "baz", last_modified: 1 },
        ],
        hasNextPage: false,
        lastModified: 0,
        totalRecords: 2,
      });
      renderWithRouter(<CollectionRecords />, routeProps);
    });

    it("should render a table", () => {
      expect(screen.getByTestId("paginatedTable")).toBeDefined();
    });

    it("should render record rows", () => {
      expect(screen.getByTestId("id1-row")).toBeDefined();
      expect(screen.getByTestId("id2-row")).toBeDefined();
      expect(screen.getByTestId("id1-foo").textContent).toBe("bar");
      expect(screen.getByTestId("id2-foo").textContent).toBe("baz");
    });

    it("should apply live filtering", () => {
      let quickFilter = screen.getByTestId("quickFilter");
      fireEvent.change(quickFilter, {
        target: { value: "bar" },
      });
      expect(screen.getByTestId("id1-row")).toBeDefined();
      expect(screen.queryByTestId("id2-row")).toBeNull();

      fireEvent.change(quickFilter, {
        target: { value: "baz" },
      });
      expect(screen.getByTestId("id2-row")).toBeDefined();
      expect(screen.queryByTestId("id1-row")).toBeNull();

      fireEvent.change(quickFilter, {
        target: { value: "" },
      });
      expect(screen.getByTestId("id1-row")).toBeDefined();
      expect(screen.queryByTestId("id2-row")).toBeDefined();
    });
  });

  describe("No schema defined", () => {
    beforeEach(() => {
      vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
        id: "collection",
        displayFields: [],
      });
      useRecordList.mockReturnValue({
        data: [
          { id: "id1", foo: "bar", last_modified: 1 },
          {
            id: "id2",
            foo: "baz",
            last_modified: 2,
            attachment: { location: "http://file" },
          },
        ],
        hasNextPage: false,
        lastModified: 0,
        totalRecords: 2,
      });
      renderWithRouter(<CollectionRecords />, routeProps);
    });

    it("should render a table", () => {
      expect(screen.getByTestId("paginatedTable")).toBeDefined();
    });

    it("should render record rows", () => {
      expect(screen.getByTestId("id1-id").textContent).toBe("id1");
      expect(screen.getByTestId("id1-__json").textContent).toBe(
        JSON.stringify({ foo: "bar" })
      );
      expect(screen.getByTestId("id2-id").textContent).toBe("id2");
      expect(screen.getByTestId("id2-__json").textContent).toBe(
        JSON.stringify({ foo: "baz" })
      );
    });
  });

  describe("Tabs", () => {
    beforeEach(() => {
      vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
        id: "collection",
        displayFields: [],
      });
      useRecordList.mockReturnValue({
        data: [],
        hasNextPage: false,
        lastModified: 0,
        totalRecords: 18,
      });
      renderWithRouter(<CollectionRecords />, routeProps);
    });

    it("should show the total number of records", () => {
      expect(screen.getByTestId("nav-records").textContent).toBe(
        "Records (18)"
      );
    });
  });

  describe("List actions", () => {
    describe("Collection write permission", () => {
      beforeEach(() => {
        vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
          id: "collection",
          schema: {
            type: "object",
            properties: {
              foo: { type: "string" },
            },
          },
          displayFields: ["foo"],
        });
        useRecordList.mockReturnValue({
          data: [],
          hasNextPage: false,
          lastModified: 0,
          totalRecords: 0,
        });
        renderWithRouter(<CollectionRecords />, routeProps);
      });

      it("should render list actions", () => {
        expect(screen.getAllByText("Create record").length).toBe(2);
        expect(screen.getAllByText("Bulk create").length).toBe(2);
      });
    });

    describe("No collection write permission", () => {
      beforeEach(() => {
        canCreateRecord.mockReturnValue(false);
        vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
          id: "collection",
          schema: {
            type: "object",
            properties: {
              foo: { type: "string" },
            },
          },
          displayFields: ["foo"],
        });
        useRecordList.mockReturnValue({
          data: [],
          hasNextPage: false,
          lastModified: 0,
          totalRecords: 0,
        });
        renderWithRouter(<CollectionRecords />, routeProps);
      });

      it("should not render list actions", () => {
        expect(screen.queryByText("Bulk create")).toBeNull();
      });
    });
  });
});
