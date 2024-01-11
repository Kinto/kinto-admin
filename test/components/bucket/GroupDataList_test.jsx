import React from "react";
import { renderWithProvider } from "../../test_utils";
import {
  DataList,
  ListActions,
} from "../../../src/components/bucket/GroupDataList";
import { canCreateGroup } from "../../../src/permission";

jest.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canCreateGroup: jest.fn(),
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
    const result = renderWithProvider(<DataList {...props} />);
    expect(result.queryByText("groupA")).toBeDefined();
    expect(result.queryByText("groupB")).toBeDefined();
    expect(result.queryByText("memberA-1, memberA-2")).toBeDefined();
    expect(result.queryByText("memberB-1, memberB-2")).toBeDefined();
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
    const result = renderWithProvider(<ListActions {...props} />);
    expect(result.queryByText("Create group")).toBeDefined();
  });

  it("Should render no Create Group button when the user lacks permission", () => {
    canCreateGroup.mockReturnValue(false);
    const result = renderWithProvider(<ListActions {...props} />);
    expect(result.queryByText("Create group")).toBeNull();
  });
});
