import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-addons-test-utils";

import { createSandbox, createComponent } from "../test_utils";

import AddForm from "../../scripts/components/AddForm";


describe("AddForm component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Schema defined", () => {
    let node, createRecord;
    const collection = {
      schema: {
        type: "object",
        properties: {
          foo: {
            type: "string"
          }
        }
      },
      permissions: {
        write: []
      }
    };
    const record = {data: {}, permissions: {}};

    beforeEach(() => {
      createRecord = sinon.spy();
      node = createComponent(AddForm, {
        params: {bid: "bucket", cid: "collection"},
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
        target: {value: "bar"}
      });

      Simulate.submit(node.querySelector("form"));

      sinon.assert.calledWithExactly(
        createRecord, "bucket", "collection", {foo: "bar"});
    });
  });

  describe.skip("No schema defined", () => {
    // XXX CodeMirror seems to be totally incompatible with JSDom.
  });
});
