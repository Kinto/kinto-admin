import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";

import { createSandbox, createComponent } from "../test_utils";

import RecordAttributes from "../../src/components/record/RecordAttributes";

describe("RecordAttributes component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const bucket = {
    id: "bucket",
    data: {},
    permissions: {
      read: [],
      write: [],
    },
  };

  describe("Schema defined", () => {
    let node, updateRecord;
    const collection = {
      data: {
        schema: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            foo: {
              type: "string",
            },
          },
        },
      },
      permissions: {
        write: [],
      },
    };
    const record = { data: { id: "abc", foo: "bar" }, permissions: {} };

    beforeEach(() => {
      updateRecord = sinon.spy();
      node = createComponent(RecordAttributes, {
        match: { params: { bid: "bucket", cid: "collection", id: "abc" } },
        session: { authenticated: true, serverInfo: { user: "plop" } },
        capabilities: {},
        bucket,
        collection,
        record,
        updateRecord,
        deleteRecord: () => {},
        deleteAttachment: () => {},
      });
    });

    it("should render a form", () => {
      expect(node.querySelector("form")).to.exist;
    });

    it("should show the id as disabled", () => {
      const field = node.querySelector("#root_id");
      expect(field.value).to.eql("abc");
      expect(field.hasAttribute("disabled")).to.be.true;
    });

    it("should show the id as disabled", () => {
      const field = node.querySelector("#root_foo");
      expect(field.value).to.eql("bar");
    });

    it("should submitted entered data", () => {
      Simulate.change(node.querySelector("#root_foo"), {
        target: { value: "baz" },
      });

      Simulate.submit(node.querySelector("form"));

      sinon.assert.calledWithExactly(
        updateRecord,
        "bucket",
        "collection",
        undefined,
        { data: { id: "abc", foo: "baz" } },
        undefined
      );
    });
  });
});
