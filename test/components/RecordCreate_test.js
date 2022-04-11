import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";
import * as React from "react";

import { createSandbox, createComponent } from "../test_utils";

import RecordCreate from "../../src/components/record/RecordCreate";
import { clone } from "../../src/utils";

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
    const props = {
      match: { params: { bid: "bucket", cid: "collection" } },
      session: { authenticated: true, serverInfo: { user: "plop" } },
      bucket,
      collection,
      record,
      createRecord,
    };

    beforeEach(() => {
      createRecord = sinon.spy();
      node = createComponent(
        <RecordCreate {...props} createRecord={createRecord} />
      );
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

    describe("ID field", () => {
      let field;

      describe("ID in schema", () => {
        const withID = clone(collection);
        withID.data.schema.properties.id = { type: "string" };

        describe("ID not in UISchema", () => {
          beforeEach(() => {
            const node = createComponent(
              <RecordCreate {...props} collection={withID} />
            );
            field = node.querySelector("#root_id");
          });

          it("should show a text field", () => {
            expect(field.getAttribute("type")).to.eql("text");
          });

          it("should be editable", () => {
            expect(field.hasAttribute("disabled")).to.be.false;
          });
        });

        describe("ID in UISchema", () => {
          const withUISchema = clone(withID);
          withUISchema.data.uiSchema = {
            id: {
              "ui:widget": "textarea",
            },
          };

          beforeEach(() => {
            const node = createComponent(
              <RecordCreate {...props} collection={withUISchema} />
            );
            field = node.querySelector("#root_id");
          });

          it("should show a custom field", () => {
            expect(field.tagName.toLowerCase()).to.eql("textarea");
          });

          it("should be editable", () => {
            expect(field.hasAttribute("disabled")).to.be.false;
          });
        });
      });

      describe("ID not in schema", () => {
        let node;
        describe("ID not in UISchema", () => {
          beforeEach(() => {
            node = createComponent(
              <RecordCreate {...props} collection={collection} />
            );
          });

          it("should not show the id field", () => {
            expect(node.querySelector("#root_id")).to.not.exist;
          });
        });

        describe("ID in UISchema", () => {
          const withUISchema = {
            ...collection,
            uiSchema: {
              id: {
                "ui:widget": "text",
              },
            },
          };

          beforeEach(() => {
            const node = createComponent(
              <RecordCreate {...props} collection={withUISchema} />
            );
            field = node.querySelector("#root_id");
          });

          it("should not show the id field", () => {
            expect(node.querySelector("#root_id")).to.not.exist;
          });
        });
      });
    });
  });

  describe.skip("No schema defined", () => {
    // XXX CodeMirror seems to be totally incompatible with JSDom.
  });
});
