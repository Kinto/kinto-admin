import { render, fireEvent } from "@testing-library/react";
import RecordBulk from "../../src/components/record/RecordBulk";
import React from "react";

// to avoid rendering a router around everything, allows for more focused testing
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Link: "a",
  };
});

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
      node = render(
        <RecordBulk
          match={{ params: { bid: "bucket", cid: "collection" } }}
          collection={collection}
          bulkCreateRecords={bulkCreateRecords}
        />
      ).container;
    });

    it("should render a form", () => {
      expect(node.querySelector("form")).toBeDefined();
    });

    it("should submitted entered data", () => {
      fireEvent.change(node.querySelector("#root_0_foo"), {
        target: { value: "bar1" },
      });
      fireEvent.change(node.querySelector("#root_1_foo"), {
        target: { value: "bar2" },
      });
      fireEvent.submit(node.querySelector("form"));
      expect(bulkCreateRecords).toHaveBeenCalledWith("bucket", "collection", [
        { foo: "bar1" },
        { foo: "bar2" },
      ]);
    });
  });

  describe.skip("No schema defined", () => {
    // XXX CodeMirror seems to be totally incompatible with JSDom.
  });
});
