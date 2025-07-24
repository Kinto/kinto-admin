import { DataList, ListActions } from "@src/components/homepage/BucketsList";
import { renderWithRouter } from "@test/testUtils";
import { canCreateBucket } from "@src/permission";
import { screen } from "@testing-library/react";
import React from "react";

vi.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canCreateBucket: vi.fn(),
  };
});

describe("BucketsList", () => {
  const props = {
    buckets: [
      {
        id: "main-workspace",
        last_modified: 1699997111073,
      },
      {
        id: "main-preview",
        last_modified: 1699997106916,
      },
    ]
  };

  it("Should render a list of groups as expected", () => {
    renderWithRouter(<DataList {...props} />);
    expect(screen.queryByText("groupA")).toBeDefined();
    expect(screen.queryByText("groupB")).toBeDefined();
    expect(screen.queryByText("memberA-1, memberA-2")).toBeDefined();
    expect(screen.queryByText("memberB-1, memberB-2")).toBeDefined();
  });

  it("Should render a spinner when showSpinner is true", () => {
    renderWithRouter(<DataList {...props} showSpinner={true} />);
    expect(screen.queryByTestId("spinner")).toBeDefined();
  });
});

describe("BucketsList list actions", () => {
  const props = {
    busy: false,
  };

  it("Should render a Create Group button when the user has permission", () => {
    canCreateBucket.mockReturnValue(true);
    renderWithRouter(<ListActions {...props} />);
    expect(screen.queryByText("Create bucket")).toBeDefined();
  });

  it("Should render no Create Group button when the user lacks permission", () => {
    canCreateBucket.mockReturnValue(false);
    renderWithRouter(<ListActions {...props} />);
    expect(screen.queryByText("Create bucket")).toBeNull();
  });
});
