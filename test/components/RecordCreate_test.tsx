import * as client from "@src/client";
import RecordCreate from "@src/components/record/RecordCreate";
import * as collectionHooks from "@src/hooks/collection";
import * as recordHooks from "@src/hooks/record";
import { canCreateRecord } from "@src/permission";
import { renderWithProvider } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("@src/permission", () => {
  return {
    __esModule: true,
    canCreateRecord: vi.fn(),
    canEditRecord: vi.fn(),
  };
});

describe("RecordCreate component", () => {
  let createRecord = vi.fn();
  beforeEach(() => {
    canCreateRecord.mockReturnValue(true);
    vi.spyOn(recordHooks, "useRecord").mockReturnValue(undefined);
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
    renderWithProvider(<RecordCreate />, {
      route: "/bucket/collection",
      path: "/:bid/:cid",
    });
  });

  it("should render a form", () => {
    expect(screen.getByTestId("formWrapper")).toBeDefined();
  });

  it("should submitted entered data", () => {
    fireEvent.change(screen.getByLabelText("foo"), {
      target: { value: "bar" },
    });

    fireEvent.click(screen.getByText("Create record"));

    expect(createRecord).toHaveBeenCalledWith({ foo: "bar" });
  });
});
