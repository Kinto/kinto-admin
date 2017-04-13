import { expect } from "chai";

import { createSandbox, createComponent } from "../test_utils";

import CollectionRecords
  from "../../src/components/collection/CollectionRecords";

describe("CollectionRecords component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
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
      node = createComponent(CollectionRecords, {
        params: { bid: "bucket", cid: "collection" },
        session: { authenticated: true, serverInfo: { user: { id: "plop" } } },
        pluginHooks: {},
        bucket,
        collection,
        capabilities,
      });
    });

    it("should render a table", () => {
      expect(node.querySelector("table")).to.exist;
    });

    it("should render record rows", () => {
      const rows = node.querySelectorAll("tbody tr");

      expect(rows).to.have.length.of(2);
      expect(rows[0].querySelectorAll("td")[0].textContent).eql("bar");
      expect(rows[1].querySelectorAll("td")[0].textContent).eql("baz");
    });
  });

  describe("No schema defined", () => {
    let node;

    const collection = {
      busy: false,
      data: {},
      permissions: {
        write: [],
      },
      recordsLoaded: true,
      records: [
        { id: "id1", foo: "bar", last_modified: 1 },
        { id: "id2", foo: "baz", last_modified: 2 },
      ],
    };

    beforeEach(() => {
      node = createComponent(CollectionRecords, {
        params: { bid: "bucket", cid: "collection" },
        session: { authenticated: true, serverInfo: { user: { id: "plop" } } },
        pluginHooks: {},
        bucket,
        collection,
        capabilities,
      });
    });

    it("should render a table", () => {
      expect(node.querySelector("table")).to.exist;
    });

    it("should render record rows", () => {
      const rows = node.querySelectorAll("tbody tr");

      expect(rows).to.have.length.of(2);
      expect(rows[0].querySelectorAll("td")[0].textContent).eql(
        JSON.stringify({ foo: "bar" })
      );
      expect(rows[1].querySelectorAll("td")[0].textContent).eql(
        JSON.stringify({ foo: "baz" })
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
      let node;

      beforeEach(() => {
        node = createComponent(CollectionRecords, {
          params: { bid: "bucket", cid: "collection" },
          session: { permissions: null },
          pluginHooks: {},
          bucket,
          collection,
          capabilities,
        });
      });

      it("should render list actions", () => {
        expect(node.querySelector(".list-actions .btn-record-add")).to.exist;
        expect(node.querySelector(".list-actions .btn-record-bulk-add")).to
          .exist;
      });
    });

    describe("No collection write permission", () => {
      let node;

      beforeEach(() => {
        node = createComponent(CollectionRecords, {
          params: { bid: "bucket", cid: "collection" },
          session: { permissions: [] },
          pluginHooks: {},
          bucket,
          collection,
          capabilities,
        });
      });

      it("should not render list actions", () => {
        expect(node.querySelector(".list-actions .btn-record-bulk-add")).to.not
          .exist;
      });
    });
  });
});
