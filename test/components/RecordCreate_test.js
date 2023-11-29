import React from "react";
import { render, fireEvent } from "@testing-library/react";
import RecordCreate from "../../src/components/record/RecordCreate";
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

describe("RecordCreate component", () => {
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
      createRecord = jest.fn();
      node = render(
        <RecordCreate {...props} createRecord={createRecord} />
      ).container;
    });

    it("should render a form", () => {
      expect(node.querySelector("form")).toBeDefined();
    });

    it("should submitted entered data", () => {
      fireEvent.change(node.querySelector("#root_foo"), {
        target: { value: "bar" },
      });

      fireEvent.submit(node.querySelector("form"));

      expect(createRecord).toHaveBeenCalledWith(
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
            const node = render(
              <RecordCreate {...props} collection={withID} />
            ).container;
            field = node.querySelector("#root_id");
          });

          it("should show a text field", () => {
            expect(field.getAttribute("type")).toBe("text");
          });

          it("should be editable", () => {
            expect(field.hasAttribute("disabled")).toBe(false);
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
              <RecordCreate {...props} collection={withUISchema} />
            ).container;
            field = node.querySelector("#root_id");
          });

          it("should show a custom field", () => {
            expect(field.tagName.toLowerCase()).toBe("textarea");
          });

          it("should be editable", () => {
            expect(field.hasAttribute("disabled")).toBe(false);
          });
        });
      });

      describe("ID not in schema", () => {
        let node;
        describe("ID not in UISchema", () => {
          beforeEach(() => {
            node = render(
              <RecordCreate {...props} collection={collection} />
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
              <RecordCreate {...props} collection={withUISchema} />
            ).container;
            field = node.querySelector("#root_id");
          });

          it("should not show the id field", () => {
            expect(node.querySelector("#root_id")).toBeNull();
          });
        });
      });
    });
  });

  describe.skip("No schema defined", () => {
    // XXX CodeMirror seems to be totally incompatible with JSDom.
  });
});
