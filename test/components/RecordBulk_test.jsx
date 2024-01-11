import { fireEvent } from "@testing-library/react";
import { renderWithProvider } from "../test_utils";
import RecordBulk from "../../src/components/record/RecordBulk";
import React from "react";

describe("RecordBulk component", () => {
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
      bulkCreateRecords = jest.fn();
      node = renderWithProvider(
        <RecordBulk
          match={{ params: { bid: "bucket", cid: "collection" } }}
          collection={collection}
          bulkCreateRecords={bulkCreateRecords}
        />
      );
    });

    it("should render a form", () => {
      expect(node.getByTestId("formWrapper")).toBeDefined();
    });

    it("should submitted entered data", () => {
      fireEvent.change(node.getAllByLabelText("foo")[0], {
        target: { value: "bar1" },
      });
      fireEvent.change(node.getAllByLabelText("foo")[1], {
        target: { value: "bar2" },
      });
      fireEvent.click(node.getByText("Bulk create"));
      expect(bulkCreateRecords).toHaveBeenCalledWith("bucket", "collection", [
        { foo: "bar1" },
        { foo: "bar2" },
      ]);
    });
  });
});
