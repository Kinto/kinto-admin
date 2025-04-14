import CollectionRecords from "@src/components/collection/CollectionRecords";
import * as recordHooks from "@src/hooks/record";
import { renderWithProvider } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

describe("CollectionRecords component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const capabilities = {
    history: {},
  };

  const bucket = {
    id: "bucket",
    data: {},
    permissions: {
      read: [],
      write: [],
    },
  };

  it("Calls useRecords every time bid or cid changes", async () => {
    const useRecordsMock = vi.fn().mockReturnValue({});
    vi.spyOn(recordHooks, "useRecords").mockImplementation(useRecordsMock);

    const props = {
      session: { authenticated: true, permissions: ["foo"] },
      bucket,
      collection: {
        busy: false,
        data: {
          schema: {
            type: "object",
            properties: {
              foo: { type: "string" },
            },
          },
          displayFields: ["foo"],
          last_modified: 123,
        },
        permissions: {
          write: ["basicauth:plop"],
        },
        recordsLoaded: true,
        records: [],
      },
      capabilities,
    };
    const result = renderWithProvider(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket1", cid: "collection1" } }}
      />
    );

    expect(useRecordsMock).toHaveBeenCalledTimes(1);

    result.rerender(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket1", cid: "collection2" } }}
      />
    );

    expect(useRecordsMock).toHaveBeenCalledTimes(2);

    result.rerender(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket2", cid: "collection2" } }}
      />
    );

    expect(useRecordsMock).toHaveBeenCalledTimes(3);

    result.rerender(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket2", cid: "collection1" } }}
      />
    );

    expect(useRecordsMock).toHaveBeenCalledTimes(4);
  });

  describe("Schema defined", () => {
    const collection = {
      busy: false,
      data: {
        schema: {
          type: "object",
          properties: {
            foo: { type: "string" },
          },
        },
        displayFields: ["foo"],
      },
      permissions: {
        write: [],
      },
      records: [
        { id: "id1", foo: "bar", last_modified: 2 },
        { id: "id2", foo: "baz", last_modified: 1 },
      ],
      recordsLoaded: true,
    };

    beforeEach(() => {
      vi.spyOn(recordHooks, "useRecords").mockReturnValue({
        data: collection.records,
        hasNextPage: false,
        lastModified: 42,
        totalRecords: collection.records.length,
        next: undefined,
      });
      renderWithProvider(
        <CollectionRecords
          match={{ params: { bid: "bucket", cid: "collection" } }}
          session={{
            authenticated: true,
            serverInfo: { user: { id: "plop" } },
          }}
          bucket={bucket}
          collection={collection}
          capabilities={capabilities}
        />
      );
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
    const collection = {
      busy: false,
      data: {
        displayFields: [],
      },
      permissions: {
        write: [],
      },
      recordsLoaded: true,
      records: [
        { id: "id1", foo: "bar", last_modified: 1 },
        {
          id: "id2",
          foo: "baz",
          last_modified: 2,
          attachment: { location: "http://file" },
        },
      ],
    };

    beforeEach(() => {
      vi.spyOn(recordHooks, "useRecords").mockReturnValue({
        data: collection.records,
        hasNextPage: false,
        lastModified: 42,
        totalRecords: collection.records.length,
        next: undefined,
      });

      renderWithProvider(
        <CollectionRecords
          match={{ params: { bid: "bucket", cid: "collection" } }}
          session={{
            authenticated: true,
            serverInfo: { user: { id: "plop" } },
          }}
          bucket={bucket}
          collection={collection}
          capabilities={capabilities}
        />
      );
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
    const collection = {
      busy: false,
      data: {},
      permissions: {},
      recordsLoaded: true,
      records: [],
      totalRecords: 18,
    };

    beforeEach(() => {
      renderWithProvider(
        <CollectionRecords
          match={{ params: { bid: "bucket", cid: "collection" } }}
          session={{}}
          bucket={bucket}
          collection={collection}
          capabilities={capabilities}
          useRecords={() => {}}
        />
      );
    });

    it("should show the total number of records", () => {
      expect(screen.getByTestId("nav-records").textContent).toBe(
        "Records (18)"
      );
    });
  });

  describe("List actions", () => {
    const collection = {
      busy: false,
      data: {
        schema: {
          type: "object",
          properties: {
            foo: { type: "string" },
          },
        },
        displayFields: ["foo"],
      },
      permissions: {
        write: ["basicauth:plop"],
      },
      recordsLoaded: true,
      records: [],
    };

    describe("Collection write permission", () => {
      beforeEach(() => {
        renderWithProvider(
          <CollectionRecords
            match={{ params: { bid: "bucket", cid: "collection" } }}
            session={{ permissions: null }}
            bucket={bucket}
            collection={collection}
            capabilities={capabilities}
            useRecords={() => {}}
          />
        );
      });

      it("should render list actions", () => {
        expect(screen.getAllByText("Create record").length).toBe(2);
        expect(screen.getAllByText("Bulk create").length).toBe(2);
      });
    });

    describe("No collection write permission", () => {
      beforeEach(() => {
        renderWithProvider(
          <CollectionRecords
            match={{ params: { bid: "bucket", cid: "collection" } }}
            session={{ permissions: [] }}
            bucket={bucket}
            collection={collection}
            capabilities={capabilities}
            useRecords={() => {}}
          />
        );
      });

      it("should not render list actions", () => {
        expect(screen.queryByText("Bulk create")).toBeNull();
      });
    });
  });

  it("Does not crash when bucket.data is nullish", () => {
    const useRecordsMock = vi.fn();

    const props = {
      session: { authenticated: true, permissions: ["foo"] },
      bucket: {
        ...bucket,
        data: null,
      },
      collection: {
        busy: false,
        data: {
          schema: {
            type: "object",
            properties: {
              foo: { type: "string" },
            },
          },
          displayFields: ["foo"],
          last_modified: 123,
        },
        permissions: {
          write: ["basicauth:plop"],
        },
        recordsLoaded: true,
        records: [],
      },
      capabilities,
      useRecords: useRecordsMock,
    };
    renderWithProvider(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket1", cid: "collection1" } }}
      />
    );
  });
});
