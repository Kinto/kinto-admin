import { DataList, ListActions } from "@src/components/bucket/GroupDataList";
import { canCreateGroup } from "@src/permission";
import { renderWithProvider } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

vi.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canCreateGroup: vi.fn(),
  };
});

describe("Bucket GroupDataList", () => {
  const props = {
    bid: "test",
    groups: [
      {
        members: ["memberB-1", "memberB-2"],
        id: "groupB",
        last_modified: 1699997111073,
      },
      {
        members: ["memberA-1", "memberA-2"],
        id: "groupA",
        last_modified: 1699997106916,
      },
    ],
    capabilities: {},
  };

  it("Should render a list of groups as expected", () => {
    renderWithProvider(<DataList {...props} />);
    expect(screen.queryByText("groupA")).toBeDefined();
    expect(screen.queryByText("groupB")).toBeDefined();
    expect(screen.queryByText("memberA-1, memberA-2")).toBeDefined();
    expect(screen.queryByText("memberB-1, memberB-2")).toBeDefined();
  });

  it("Should render a spinner when showSpinner is true", () => {
    renderWithProvider(<DataList {...props} showSpinner={true} />);
    expect(screen.queryByTestId("spinner")).toBeDefined();
  });
});

describe("Bucket GroupListActions", () => {
  const props = {
    bid: "test-bucket",
    session: {
      busy: false,
    },
    bucket: {
      busy: false,
      data: {
        id: "test-bucket",
      },
    },
  };

  it("Should render a Create Group button when the user has permission", () => {
    canCreateGroup.mockReturnValue(true);
    renderWithProvider(<ListActions {...props} />);
    expect(screen.queryByText("Create group")).toBeDefined();
  });

  it("Should render no Create Group button when the user lacks permission", () => {
    canCreateGroup.mockReturnValue(false);
    renderWithProvider(<ListActions {...props} />);
    expect(screen.queryByText("Create group")).toBeNull();
  });
});
