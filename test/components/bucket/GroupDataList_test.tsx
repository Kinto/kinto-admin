import { DataList, ListActions } from "@src/components/bucket/GroupDataList";
import { canCreateGroup } from "@src/permission";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";

vi.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canCreateGroup: vi.fn(),
  };
});

describe("Bucket GroupDataList", () => {
  const props = {
    bid: "test",
    groups: {
      data: [
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
      hasNextPage: false,
    },
    capabilities: {},
  };

  it("Should render a list of groups as expected", () => {
    renderWithRouter(<DataList {...props} />);
    expect(screen.getByText("groupA")).toBeInTheDocument();
    expect(screen.getByText("groupB")).toBeInTheDocument();
    expect(screen.getByText("memberA-1, memberA-2")).toBeInTheDocument();
    expect(screen.getByText("memberB-1, memberB-2")).toBeInTheDocument();
  });

  it("Should render a spinner when showSpinner is true", () => {
    renderWithRouter(<DataList {...props} showSpinner={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
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
    renderWithRouter(<ListActions {...props} />);
    expect(screen.getByText("Create group")).toBeInTheDocument();
  });

  it("Should render no Create Group button when the user lacks permission", () => {
    canCreateGroup.mockReturnValue(false);
    renderWithRouter(<ListActions {...props} />);
    expect(screen.queryByText("Create group")).toBeNull();
  });
});
