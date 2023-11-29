import { renderWithProvider } from "../test_utils";
import CollectionRecords from "../../src/components/collection/CollectionRecords";
import React from "react";

describe("CollectionRecords component", () => {
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

  it("Calls listRecords every time bid or cid changes", async () => {
    const listRecordsMock = jest.fn();

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
      listRecords: listRecordsMock,
    };
    const result = renderWithProvider(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket1", cid: "collection1" } }}
      />
    );

    expect(listRecordsMock).toHaveBeenCalledTimes(1);

    result.rerender(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket1", cid: "collection2" } }}
      />
    );

    expect(listRecordsMock).toHaveBeenCalledTimes(2);

    result.rerender(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket2", cid: "collection2" } }}
      />
    );

    expect(listRecordsMock).toHaveBeenCalledTimes(3);

    result.rerender(
      <CollectionRecords
        {...props}
        match={{ params: { bid: "bucket2", cid: "collection1" } }}
      />
    );

    expect(listRecordsMock).toHaveBeenCalledTimes(4);
  });

  describe("Schema defined", () => {
    let node;

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
      node = renderWithProvider(
        <CollectionRecords
          match={{ params: { bid: "bucket", cid: "collection" } }}
          session={{
            authenticated: true,
            serverInfo: { user: { id: "plop" } },
          }}
          bucket={bucket}
          collection={collection}
          capabilities={capabilities}
          listRecords={() => {}}
        />
      ).container;
    });

    it("should render a table", () => {
      expect(node.querySelector("table")).toBeDefined();
    });

    it("should render record rows", () => {
      const rows = node.querySelectorAll("tbody tr");

      expect(rows).toHaveLength(2);
      expect(rows[0].querySelectorAll("td")[0].textContent).toBe("bar");
      expect(rows[1].querySelectorAll("td")[0].textContent).toBe("baz");
    });
  });

  describe("No schema defined", () => {
    let node;

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
      node = renderWithProvider(
        <CollectionRecords
          match={{ params: { bid: "bucket", cid: "collection" } }}
          session={{
            authenticated: true,
            serverInfo: { user: { id: "plop" } },
          }}
          bucket={bucket}
          collection={collection}
          capabilities={capabilities}
          listRecords={() => {}}
        />
      ).container;
    });

    it("should render a table", () => {
      expect(node.querySelector("table")).toBeDefined();
    });

    it("should render record rows", () => {
      const rows = node.querySelectorAll("tbody tr");

      expect(rows).toHaveLength(2);
      expect(rows[0].querySelectorAll("td")[0].textContent).toBe("id1");
      expect(rows[0].querySelectorAll("td")[1].textContent).toBe(
        JSON.stringify({ foo: "bar" })
      );
      expect(rows[1].querySelectorAll("td")[0].textContent).toBe("id2");
      expect(rows[1].querySelectorAll("td")[1].textContent).toBe(
        JSON.stringify({ foo: "baz" })
      );
    });
  });

  describe("Tabs", () => {
    let node;

    const collection = {
      busy: false,
      data: {},
      permissions: {},
      recordsLoaded: true,
      records: [],
      totalRecords: 18,
    };

    beforeEach(() => {
      node = renderWithProvider(
        <CollectionRecords
          match={{ params: { bid: "bucket", cid: "collection" } }}
          session={{}}
          bucket={bucket}
          collection={collection}
          capabilities={capabilities}
          listRecords={() => {}}
        />
      ).container;
    });

    it("should show the total number of records", () => {
      expect(
        node.querySelector(".card-header-tabs .nav-link.active").textContent
      ).toBe("Records (18)");
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
      let node;

      beforeEach(() => {
        node = renderWithProvider(
          <CollectionRecords
            match={{ params: { bid: "bucket", cid: "collection" } }}
            session={{ permissions: null }}
            bucket={bucket}
            collection={collection}
            capabilities={capabilities}
            listRecords={() => {}}
          />
        ).container;
      });

      it("should render list actions", () => {
        expect(
          node.querySelector(".list-actions .btn-record-add")
        ).toBeDefined();
        expect(
          node.querySelector(".list-actions .btn-record-bulk-add")
        ).toBeDefined();
      });
    });

    describe("No collection write permission", () => {
      let node;

      beforeEach(() => {
        node = renderWithProvider(
          <CollectionRecords
            match={{ params: { bid: "bucket", cid: "collection" } }}
            session={{ permissions: [] }}
            bucket={bucket}
            collection={collection}
            capabilities={capabilities}
            listRecords={() => {}}
          />
        ).container;
      });

      it("should not render list actions", () => {
        expect(
          node.querySelector(".list-actions .btn-record-bulk-add")
        ).toBeNull();
      });
    });
  });
});
