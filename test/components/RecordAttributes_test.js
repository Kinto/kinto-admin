import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";
import * as React from "react";

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
      node = createComponent(
        <RecordAttributes {...props} updateRecord={updateRecord} />
      );
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
        { data: { id: "abc", foo: "baz", last_modified: 123 } },
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
      node = createComponent(
        <RecordAttributes
          {...props}
          capabilities={{ attachments: { base_url: "" } }}
          record={record}
        />
      );
    });

    it("should render the attachment info", () => {
      expect(node.querySelector(".attachment-info")).to.exist;
    });

    it("should show a delete attachment button", () => {
      expect(node.querySelector(".attachment-action .btn.btn-danger")).to.exist;
    });

    describe("With Gzipped attachment", () => {
      const gzipped = clone(record);
      gzipped.data.attachment.original = {
        filename: "plop.png",
        size: 99999,
      };

      beforeEach(() => {
        node = createComponent(
          <RecordAttributes
            {...props}
            capabilities={{ attachments: { base_url: "" } }}
            record={gzipped}
          />
        );
      });

      it("should show original file attributes", () => {
        expect(
          node.querySelector(
            ".attachment-info table:nth-child(2) tr:nth-child(3) td"
          ).textContent
        ).to.eql("100 kB");
      });
    });
  });

  describe("Kinto fields", () => {
    let field;

    describe("ID in schema", () => {
      const withID = clone(collection);
      withID.data.schema.properties.id = { type: "string" };

      describe("ID not in UISchema", () => {
        beforeEach(() => {
          const node = createComponent(
            <RecordAttributes {...props} collection={withID} />
          );
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
          const node = createComponent(
            <RecordAttributes {...props} collection={withUISchema} />
          );
          field = node.querySelector("#root_id");
        });

        it("should load the id value", () => {
          expect(field.value).to.eql("abc");
        });

        it("should show a custom field", () => {
          expect(field.tagName.toLowerCase()).to.eql("textarea");
        });

        it("should show the custom widget as disabled", () => {
          expect(field.hasAttribute("disabled")).to.be.true;
        });
      });
    });

    describe("ID not in schema", () => {
      let node;
      describe("ID not in UISchema", () => {
        beforeEach(() => {
          node = createComponent(
            <RecordAttributes {...props} collection={collection} />
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
            <RecordAttributes {...props} collection={withUISchema} />
          );
          field = node.querySelector("#root_id");
        });

        it("should not show the id field", () => {
          expect(node.querySelector("#root_id")).to.not.exist;
        });
      });
    });

    describe("Schema version in schema", () => {
      const record = {
        data: {
          id: "abc",
          last_modified: 123,
          foo: "bar",
          schema: 567890,
        },
        permissions: {},
      };

      const withSchemaVersion = clone(collection);
      withSchemaVersion.data.schema.properties.schema = { type: "integer" };

      describe("Schema version not in UISchema", () => {
        beforeEach(() => {
          const node = createComponent(
            <RecordAttributes
              {...props}
              collection={withSchemaVersion}
              record={record}
            />
          );
          field = node.querySelector("#root_schema");
        });

        it("should load the schema value", () => {
          expect(field.value).to.eql("567890");
        });

        it("should be a hidden field", () => {
          expect(field.getAttribute("type")).to.eql("hidden");
        });
      });

      describe("Schema version in UISchema", () => {
        const withUISchema = clone(withSchemaVersion);
        withUISchema.data.uiSchema = {
          schema: {
            "ui:widget": "text",
            "ui:options": {
              inputType: "text",
            },
          },
        };

        beforeEach(() => {
          const node = createComponent(
            <RecordAttributes
              {...props}
              collection={withUISchema}
              record={record}
            />
          );
          field = node.querySelector("#root_schema");
        });

        it("should load the schema value", () => {
          expect(field.value).to.eql("567890");
        });

        it("should show a custom field", () => {
          expect(field.getAttribute("type")).to.eql("text");
        });

        it("should show the custom widget as disabled", () => {
          expect(field.hasAttribute("disabled")).to.be.true;
        });
      });
    });

    describe("Schema version not in schema", () => {
      let node;
      describe("Schema version not in UISchema", () => {
        beforeEach(() => {
          node = createComponent(
            <RecordAttributes
              {...props}
              collection={collection}
              record={record}
            />
          );
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_schema")).to.not.exist;
        });
      });

      describe("Schema version in UISchema", () => {
        const withUISchema = {
          ...collection,
          record,
          uiSchema: {
            schema: {
              "ui:widget": "textarea",
            },
          },
        };

        beforeEach(() => {
          createComponent(
            <RecordAttributes {...props} collection={withUISchema} />
          );
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_schema")).to.not.exist;
        });
      });
    });

    describe("Last modified in schema", () => {
      const record = {
        data: {
          id: "abc",
          last_modified: 123,
          foo: "bar",
        },
        permissions: {},
      };

      const withLastmodified = clone(collection);
      withLastmodified.data.schema.properties.last_modified = {
        type: "integer",
      };

      describe("Last modified not in UISchema", () => {
        beforeEach(() => {
          const node = createComponent(
            <RecordAttributes
              {...props}
              collection={withLastmodified}
              record={record}
            />
          );
          field = node.querySelector("#root_last_modified");
        });

        it("should load the schema value", () => {
          expect(field.value).to.eql("123");
        });

        it("should be a hidden field", () => {
          expect(field.getAttribute("type")).to.eql("hidden");
        });
      });

      describe("Last modified in UISchema", () => {
        const withUISchema = clone(withLastmodified);
        withUISchema.data.uiSchema = {
          last_modified: {
            "ui:widget": "text",
            "ui:options": {
              inputType: "text",
            },
          },
        };

        beforeEach(() => {
          const node = createComponent(
            <RecordAttributes
              {...props}
              collection={withUISchema}
              record={record}
            />
          );
          field = node.querySelector("#root_last_modified");
        });

        it("should load the schema value", () => {
          expect(field.value).to.eql("123");
        });

        it("should show a custom field", () => {
          expect(field.getAttribute("type")).to.eql("text");
        });

        it("should show the custom widget as disabled", () => {
          expect(field.hasAttribute("disabled")).to.be.true;
        });
      });
    });

    describe("Last modified not in schema", () => {
      let node;
      describe("Last modified not in UISchema", () => {
        beforeEach(() => {
          node = createComponent(
            <RecordAttributes
              {...props}
              collection={collection}
              record={record}
            />
          );
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_last_modified")).to.not.exist;
        });
      });

      describe("Last modified in UISchema", () => {
        const withUISchema = {
          ...collection,
          record,
          uiSchema: {
            last_modified: {
              "ui:widget": "textarea",
            },
          },
        };

        beforeEach(() => {
          createComponent(
            <RecordAttributes {...props} collection={withUISchema} />
          );
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_last_modified")).to.not.exist;
        });
      });
    });
  });
});
