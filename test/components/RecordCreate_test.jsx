import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProvider } from "../test_utils";
import RecordCreate from "../../src/components/record/RecordCreate";

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
      node = renderWithProvider(<RecordCreate {...props} createRecord={createRecord} />);
    });

    it("should render a form", () => {
      expect(node.getByTestId("formWrapper")).toBeDefined();
    });

    it("should submitted entered data", () => {
      fireEvent.change(node.getByLabelText("foo"), {
        target: { value: "bar" },
      });

      fireEvent.click(node.getByText("Create record"));

      expect(createRecord).toHaveBeenCalledWith(
        "bucket",
        "collection",
        { foo: "bar" },
        undefined
      );
    });
  });
});
