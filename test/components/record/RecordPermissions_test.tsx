import { RecordPermissions } from "@src/components/record/RecordPermissions";
import * as recordHooks from "@src/hooks/record";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

describe("RecordPermissions component", () => {
  beforeEach(() => {
    vi.spyOn(recordHooks, "useRecord").mockReturnValue(undefined);
  });

  const route =
    "/buckets/test-bucket/collections/test-collection/records/test-record/permissions";
  const path = "/buckets/:bid/collections/:cid/records/:rid/permissions";
  it("renders", () => {
    renderWithRouter(<RecordPermissions />, {
      route: route,
      path: path,
    });
    expect(screen.getByText(/Edit.*record permissions/).textContent).toBe(
      "Edit test-bucket/test-collection/test-record record permissions"
    );
  });

  it("renders a loading spinner when record is busy", async () => {
    renderWithRouter(<RecordPermissions />, {
      route: route,
      path: path,
    });
    expect(await screen.findByTestId("spinner")).toBeDefined();
  });
});
