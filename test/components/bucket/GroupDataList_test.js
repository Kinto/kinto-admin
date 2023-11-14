import React from "react";
import { render } from "@testing-library/react";
import {
  DataList,
  ListActions,
} from "../../../src/components/bucket/GroupDataList";
import { canEditBucket } from "../../../src/permission";

jest.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canEditBucket: jest.fn(),
  };
});

// to avoid rendering a router around everything, allows for more focused testing
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Link: "a",
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
    const result = render(<DataList {...props} />);
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
    },
  };

  it("Should render a Create Group button when the user has permission", () => {
    canEditBucket.mockReturnValue(true);
    const result = render(<ListActions {...props} />);
    expect(result.queryByText("Create group")).toBeDefined();
  });

  it("Should render no Create Group button when the user lacks permission", () => {
    canEditBucket.mockReturnValue(false);
    const result = render(<ListActions {...props} />);
    expect(result.queryByText("Create group")).toBeNull();
  });
});
