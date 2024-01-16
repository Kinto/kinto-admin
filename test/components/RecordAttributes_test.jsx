import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProvider } from "../test_utils";
import RecordAttributes from "../../src/components/record/RecordAttributes";
import { clone } from "../../src/utils";

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
    updateRecord: () => { },
    deleteRecord: () => { },
    deleteAttachment: () => { },
  };

  describe("Simple schema", () => {
    let node, updateRecord;

    beforeEach(() => {
      updateRecord = vi.fn();
      node = renderWithProvider(
        <RecordAttributes {...props} updateRecord={updateRecord} />
      );
    });

    it("should render a form", () => {
      expect(node.getByTestId("formWrapper")).toBeDefined();
    });

    it("should submitted entered data", () => {
      const field = node.getByLabelText("foo");

      expect(field.value).toBe("bar");
      fireEvent.change(field, { target: { value: "baz" } });
      fireEvent.click(node.getByText("Update record"));

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
      node = renderWithProvider(
        <RecordAttributes
          {...props}
          capabilities={{ attachments: { base_url: "" } }}
          record={record}
        />
      );
    });

    it("should render the attachment info", () => {
      expect(node.getByText("Attachment information")).toBeDefined();
    });

    it("should show a delete attachment button", () => {
      expect(node.getByText("Delete this attachment")).toBeDefined();
    });

    describe("With Gzipped attachment", () => {
      const gzipped = clone(record);
      gzipped.data.attachment.original = {
        filename: "plop.png",
        size: 99999,
      };

      beforeEach(() => {
        node = renderWithProvider(
          <RecordAttributes
            {...props}
            capabilities={{ attachments: { base_url: "" } }}
            record={gzipped}
          />
        );
      });

      it("should show original file attributes", () => {
        expect(node.getByTestId("attachmentInfo-currentSize").textContent).toBe(
          "100 kB"
        );
      });
    });
  });

  describe("Kinto fields", () => {
    let field;

    describe("ID in schema", () => {
      const withID = clone(collection);
      withID.data.schema.properties.id = { type: "string" };

      describe("ID in UISchema", () => {
        const withUISchema = clone(withID);
        withUISchema.data.uiSchema = {
          id: {
            "ui:widget": "textarea",
          },
        };

        beforeEach(() => {
          const node = renderWithProvider(
            <RecordAttributes {...props} collection={withUISchema} />
          );
          field = node.getByLabelText("id");
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
  });
});
