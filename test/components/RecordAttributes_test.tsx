import * as client from "@src/client";
import RecordAttributes from "@src/components/record/RecordAttributes";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as collectionHooks from "@src/hooks/collection";
import * as recordHooks from "@src/hooks/record";
import * as sessionHooks from "@src/hooks/session";
import { canEditRecord } from "@src/permission";
import { clone } from "@src/utils";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("@src/permission", () => {
  return {
    __esModule: true,
    canEditRecord: vi.fn(),
  };
});

const collection = {
  schema: {
    type: "object",
    properties: {
      foo: {
        type: "string",
      },
    },
  },
  attachment: {
    enabled: true,
    required: false,
  },
};

describe("RecordAttributes component", () => {
  const updateRecord = vi.fn();

  beforeEach(() => {
    canEditRecord.mockReturnValue(true);
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(DEFAULT_SERVERINFO);
    vi.spyOn(recordHooks, "useRecord").mockReturnValue({
      data: { id: "abc", last_modified: 123, foo: "bar" },
    });
    vi.spyOn(collectionHooks, "useCollection").mockReturnValue(collection);
    vi.spyOn(client, "getClient").mockReturnValue({
      bucket: bid => {
        return {
          collection: cid => {
            return {
              updateRecord,
            };
          },
        };
      },
    });
  });

  const routeProps = {
    route: "/bucket/collection/abc",
    path: "/:bid/:cid/:rid",
  };

  describe("Simple schema", () => {
    beforeEach(() => {
      renderWithRouter(<RecordAttributes />, routeProps);
    });

    it("should render a form", () => {
      expect(screen.getByTestId("formWrapper")).toBeDefined();
    });

    it("should submitted entered data", () => {
      const field = screen.getByLabelText("foo");

      expect(field.value).toBe("bar");
      fireEvent.change(field, { target: { value: "baz" } });
      fireEvent.click(screen.getByText("Update record"));

      expect(updateRecord).toHaveBeenCalledWith(
        {
          id: "abc",
          foo: "baz",
          last_modified: 123,
        },
        { safe: true }
      );
    });
  });

  describe("Attachment info shown", () => {
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
    };

    beforeEach(() => {
      vi.spyOn(recordHooks, "useRecord").mockReturnValueOnce(record);
      renderWithRouter(<RecordAttributes />, routeProps);
    });

    it("should render the attachment info", () => {
      expect(screen.getByText("Attachment information")).toBeDefined();
    });

    it("should show a delete attachment button", () => {
      expect(screen.getByText("Delete this attachment")).toBeDefined();
    });

    describe("With Gzipped attachment", () => {
      const gzipped = clone(record);
      gzipped.data.attachment.original = {
        filename: "plop.png",
        size: 99999,
      };

      beforeEach(() => {
        vi.spyOn(recordHooks, "useRecord").mockReturnValueOnce(gzipped);

        renderWithRouter(<RecordAttributes />, routeProps);
      });

      it("should show original file attributes", () => {
        expect(
          screen.getByTestId("attachmentInfo-currentSize").textContent
        ).toBe("100 kB");
      });
    });
  });

  describe("Kinto fields", () => {
    let field;

    describe("ID in schema", () => {
      const withID = clone(collection);
      withID.schema.properties.id = { type: "string" };

      describe("ID in UISchema", () => {
        const withUISchema = clone(withID);
        withUISchema.uiSchema = {
          id: {
            "ui:widget": "textarea",
          },
        };

        beforeEach(() => {
          vi.spyOn(collectionHooks, "useCollection").mockReturnValueOnce(
            withUISchema
          );
          renderWithRouter(<RecordAttributes />);
          field = screen.getByLabelText("id");
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
