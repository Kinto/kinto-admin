import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-addons-test-utils";

import { createSandbox, createComponent } from "../test_utils";

import RecordBulk from "../../src/components/record/RecordBulk";

describe("RecordBulk component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Schema defined", () => {
    let node, bulkCreateRecords;
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
    };

    beforeEach(() => {
      bulkCreateRecords = sinon.spy();
      node = createComponent(RecordBulk, {
        params: { bid: "bucket", cid: "collection" },
        collection,
        bulkCreateRecords,
      });
    });

    it("should render a form", () => {
      expect(node.querySelector("form")).to.exist;
    });

    it("should submitted entered data", () => {
      return new Promise(setImmediate)
        .then(() => {
          Simulate.change(node.querySelector("#root_0_foo"), {
            target: { value: "bar1" },
          });
          return new Promise(setImmediate);
        })
        .then(() => {
          Simulate.change(node.querySelector("#root_1_foo"), {
            target: { value: "bar2" },
          });
          return new Promise(setImmediate);
        })
        .then(() => {
          Simulate.submit(node.querySelector("form"));

          sinon.assert.calledWithExactly(
            bulkCreateRecords,
            "bucket",
            "collection",
            [{ foo: "bar1" }, { foo: "bar2" }]
          );
        });
    });
  });

  describe.skip("No schema defined", () => {
    // XXX CodeMirror seems to be totally incompatible with JSDom.
  });
});
