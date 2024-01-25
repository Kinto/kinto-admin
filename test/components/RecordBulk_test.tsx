import RecordBulk from "../../src/components/record/RecordBulk";
import { renderWithProvider } from "../testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

describe("RecordBulk component", () => {
  describe("Schema defined", () => {
    let bulkCreateRecords;
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
      bulkCreateRecords = vi.fn();
      renderWithProvider(
        <RecordBulk
          match={{ params: { bid: "bucket", cid: "collection" } }}
          collection={collection}
          bulkCreateRecords={bulkCreateRecords}
        />
      );
    });

    it("should render a form", () => {
      expect(screen.getByTestId("formWrapper")).toBeDefined();
    });

    it("should submitted entered data", () => {
      fireEvent.change(screen.getAllByLabelText("foo")[0], {
        target: { value: "bar1" },
      });
      fireEvent.change(screen.getAllByLabelText("foo")[1], {
        target: { value: "bar2" },
      });
      fireEvent.click(screen.getByText("Bulk create"));
      expect(bulkCreateRecords).toHaveBeenCalledWith("bucket", "collection", [
        { foo: "bar1" },
        { foo: "bar2" },
      ]);
    });
  });
});
