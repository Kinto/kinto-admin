import * as client from "@src/client";
import RecordBulk from "@src/components/record/RecordBulk";
import * as collectionHooks from "@src/hooks/collection";
import { renderWithProvider } from "@test/testUtils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";

describe("RecordBulk component", () => {
  describe("Schema defined", () => {
    let createRecord = vi.fn();

    beforeEach(() => {
      vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
        schema: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
          },
        },
      });

      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            collection: cid => {
              return {
                createRecord,
              };
            },
          };
        },
      });

      renderWithProvider(<RecordBulk />, {
        route: "/bucket/collection",
        path: "/:bid/:cid",
      });
    });

    it("should render a form", () => {
      expect(screen.getByTestId("formWrapper")).toBeDefined();
    });

    it("should submitted entered data", async () => {
      fireEvent.change(screen.getAllByLabelText("foo")[0], {
        target: { value: "bar1" },
      });
      fireEvent.change(screen.getAllByLabelText("foo")[1], {
        target: { value: "bar2" },
      });
      fireEvent.click(screen.getByText("Bulk create"));

      await waitFor(() => {
        expect(createRecord).toHaveBeenCalledWith({ foo: "bar1" });
        expect(createRecord).toHaveBeenCalledWith({ foo: "bar2" });
      });
    });
  });
});
