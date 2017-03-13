import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-addons-test-utils";

import { createSandbox, createComponent } from "../test_utils";

import RecordCreate from "../../src/components/record/RecordCreate";

describe("RecordCreate component", () => {
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
    let node, createRecord;
    const collection = {
      data: {
        schema: {
          type: "object",
          properties: {
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
    const record = { data: {}, permissions: {} };

    beforeEach(() => {
      createRecord = sinon.spy();
      node = createComponent(RecordCreate, {
        params: { bid: "bucket", cid: "collection" },
        session: { authenticated: true, serverInfo: { user: "plop" } },
        bucket,
        collection,
        record,
        createRecord,
      });
    });

    it("should render a form", () => {
      expect(node.querySelector("form")).to.exist;
    });

    it("should submitted entered data", () => {
      Simulate.change(node.querySelector("#root_foo"), {
        target: { value: "bar" },
      });

      Simulate.submit(node.querySelector("form"));

      sinon.assert.calledWithExactly(
        createRecord,
        "bucket",
        "collection",
        { foo: "bar" },
        undefined
      );
    });
  });

  describe.skip("No schema defined", () => {
    // XXX CodeMirror seems to be totally incompatible with JSDom.
  });
});
