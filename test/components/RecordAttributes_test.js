import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";

import { createSandbox, createComponent } from "../test_utils";

import RecordAttributes from "../../src/components/record/RecordAttributes";
import { clone } from "../../src/utils";

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

  const record = {
    data: { id: "abc", last_modified: 123, foo: "bar" },
    permissions: {},
  };

  const match = { params: { bid: "bucket", cid: "collection", id: "abc" } };
  const session = { authenticated: true, serverInfo: { user: "plop" } };
  const capabilities = {};
  const props = {
    match,
    session,
    capabilities,
    bucket,
    collection,
    record,
    updateRecord: () => {},
    deleteRecord: () => {},
    deleteAttachment: () => {},
  };

  describe("Simple schema", () => {
    let node, updateRecord;

    beforeEach(() => {
      updateRecord = sinon.spy();
      node = createComponent(RecordAttributes, {
        ...props,
        updateRecord,
      });
    });

    it("should render a form", () => {
      expect(node.querySelector("form")).to.exist;
    });

    it("should submitted entered data", () => {
      const field = node.querySelector("#root_foo");

      expect(field.value).to.eql("bar");
      Simulate.change(field, { target: { value: "baz" } });
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

  describe("Attachment info shown", () => {
    let node;

    const record = {
      data: {
        id: "abc",
        foo: "bar",
        attachment: {
          location: "path/file.png",
          mimetype: "image/png",
          size: 12345,
        },
      },
      permissions: {},
    };

    beforeEach(() => {
      node = createComponent(RecordAttributes, {
        ...props,
        capabilities: { attachments: { base_url: "" } },
        record,
      });
    });

    it("should render the attachment info", () => {
      expect(node.querySelector(".attachment-info")).to.exist;
    });

    it("should show a delete attachment button", () => {
      expect(node.querySelector(".attachment-action .btn.btn-danger")).to.exist;
    });
  });

  describe("ID field", () => {
    let field;

    describe("ID in schema", () => {
      const withID = clone(collection);
      withID.data.schema.properties.id = { type: "string" };

      describe("ID not in UISchema", () => {
        beforeEach(() => {
          const node = createComponent(RecordAttributes, {
            ...props,
            collection: withID,
          });
          field = node.querySelector("#root_id");
        });

        it("should load the id value", () => {
          expect(field.value).to.eql("abc");
        });

        it("should show a text field", () => {
          expect(field.getAttribute("type")).to.eql("text");
        });

        it("should show the id as disabled", () => {
          expect(field.hasAttribute("disabled")).to.be.true;
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
          const node = createComponent(RecordAttributes, {
            ...props,
            collection: withUISchema,
          });
          field = node.querySelector("#root_id");
        });

        it("should load the id value", () => {
          expect(field.value).to.eql("abc");
        });

        it("should show a custom field", () => {
          expect(field.tagName.toLowerCase()).to.eql("textarea");
        });

        it("should show the id as disabled", () => {
          expect(field.hasAttribute("disabled")).to.be.true;
        });
      });
    });

    describe("ID not in schema", () => {
      let node;
      describe("ID not in UISchema", () => {
        beforeEach(() => {
          node = createComponent(RecordAttributes, {
            ...props,
            collection,
          });
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
          const node = createComponent(RecordAttributes, {
            ...props,
            collection: withUISchema,
          });
          field = node.querySelector("#root_id");
        });

        it("should not show the id field", () => {
          expect(node.querySelector("#root_id")).to.not.exist;
        });
      });
    });
  });
});
