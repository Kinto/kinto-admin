import React from "react";
import { render, fireEvent } from "@testing-library/react";
import RecordAttributes from "../../src/components/record/RecordAttributes";
import { clone } from "../../src/utils";

// to avoid rendering a router around everything, allows for more focused testing
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Link: "a",
  };
});

describe("RecordAttributes component", () => {
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
      updateRecord = jest.fn();
      node = render(
        <RecordAttributes {...props} updateRecord={updateRecord} />
      ).container;
    });

    it("should render a form", () => {
      expect(node.querySelector("form")).toBeDefined();
    });

    it("should submitted entered data", () => {
      const field = node.querySelector("#root_foo");

      expect(field.value).toBe("bar");
      fireEvent.change(field, { target: { value: "baz" } });
      fireEvent.submit(node.querySelector("form"));

      expect(updateRecord).toHaveBeenCalledWith(
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
      node = render(
        <RecordAttributes
          {...props}
          capabilities={{ attachments: { base_url: "" } }}
          record={record}
        />
      ).container;
    });

    it("should render the attachment info", () => {
      expect(node.querySelector(".attachment-info")).toBeDefined();
    });

    it("should show a delete attachment button", () => {
      expect(
        node.querySelector(".attachment-action .btn.btn-danger")
      ).toBeDefined();
    });

    describe("With Gzipped attachment", () => {
      const gzipped = clone(record);
      gzipped.data.attachment.original = {
        filename: "plop.png",
        size: 99999,
      };

      beforeEach(() => {
        node = render(
          <RecordAttributes
            {...props}
            capabilities={{ attachments: { base_url: "" } }}
            record={gzipped}
          />
        ).container;
      });

      it("should show original file attributes", () => {
        expect(
          node.querySelector(
            ".attachment-info table:nth-child(2) tr:nth-child(3) td"
          ).textContent
        ).toBe("100 kB");
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
          const node = render(
            <RecordAttributes {...props} collection={withID} />
          ).container;
          field = node.querySelector("#root_id");
        });

        it("should load the id value", () => {
          expect(field.value).toBe("abc");
        });

        it("should show a text field", () => {
          expect(field.getAttribute("type")).toBe("text");
        });

        it("should show the id as disabled", () => {
          expect(field.hasAttribute("disabled")).toBe(true);
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
          const node = render(
            <RecordAttributes {...props} collection={withUISchema} />
          ).container;
          field = node.querySelector("#root_id");
        });

        it("should load the id value", () => {
          expect(field.value).toBe("abc");
        });

        it("should show a custom field", () => {
          expect(field.tagName.toLowerCase()).toBe("textarea");
        });

        it("should show the custom widget as disabled", () => {
          expect(field.hasAttribute("disabled")).toBe(true);
        });
      });
    });

    describe("ID not in schema", () => {
      let node;
      describe("ID not in UISchema", () => {
        beforeEach(() => {
          node = render(
            <RecordAttributes {...props} collection={collection} />
          ).container;
        });

        it("should not show the id field", () => {
          expect(node.querySelector("#root_id")).toBeNull();
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
          const node = render(
            <RecordAttributes {...props} collection={withUISchema} />
          ).container;
          field = node.querySelector("#root_id");
        });

        it("should not show the id field", () => {
          expect(node.querySelector("#root_id")).toBeNull();
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
          const node = render(
            <RecordAttributes
              {...props}
              collection={withSchemaVersion}
              record={record}
            />
          ).container;
          field = node.querySelector("#root_schema");
        });

        it("should load the schema value", () => {
          expect(field.value).toBe("567890");
        });

        it("should be a hidden field", () => {
          expect(field.getAttribute("type")).toBe("hidden");
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
          const node = render(
            <RecordAttributes
              {...props}
              collection={withUISchema}
              record={record}
            />
          ).container;
          field = node.querySelector("#root_schema");
        });

        it("should load the schema value", () => {
          expect(field.value).toBe("567890");
        });

        it("should show a custom field", () => {
          expect(field.getAttribute("type")).toBe("text");
        });

        it("should show the custom widget as disabled", () => {
          expect(field.hasAttribute("disabled")).toBe(true);
        });
      });
    });

    describe("Schema version not in schema", () => {
      let node;
      describe("Schema version not in UISchema", () => {
        beforeEach(() => {
          node = render(
            <RecordAttributes
              {...props}
              collection={collection}
              record={record}
            />
          ).container;
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_schema")).toBeNull();
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
          render(<RecordAttributes {...props} collection={withUISchema} />)
            .container;
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_schema")).toBeNull();
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
          const node = render(
            <RecordAttributes
              {...props}
              collection={withLastmodified}
              record={record}
            />
          ).container;
          field = node.querySelector("#root_last_modified");
        });

        it("should load the schema value", () => {
          expect(field.value).toBe("123");
        });

        it("should be a hidden field", () => {
          expect(field.getAttribute("type")).toBe("hidden");
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
          const node = render(
            <RecordAttributes
              {...props}
              collection={withUISchema}
              record={record}
            />
          ).container;
          field = node.querySelector("#root_last_modified");
        });

        it("should load the schema value", () => {
          expect(field.value).toBe("123");
        });

        it("should show a custom field", () => {
          expect(field.getAttribute("type")).toBe("text");
        });

        it("should show the custom widget as disabled", () => {
          expect(field.hasAttribute("disabled")).toBe(true);
        });
      });
    });

    describe("Last modified not in schema", () => {
      let node;
      describe("Last modified not in UISchema", () => {
        beforeEach(() => {
          node = render(
            <RecordAttributes
              {...props}
              collection={collection}
              record={record}
            />
          ).container;
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_last_modified")).toBeNull();
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
          render(<RecordAttributes {...props} collection={withUISchema} />)
            .container;
        });

        it("should not show the schema field", () => {
          expect(node.querySelector("#root_last_modified")).toBeNull();
        });
      });
    });
  });
});
