import { DataList, ListActions } from "@src/components/homepage/BucketsList";
import { canCreateBucket } from "@src/permission";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";

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
    ],
  };

  it("Should render a list of buckets as expected", () => {
    renderWithRouter(<DataList {...props} />);
    expect(screen.getByText("main-workspace")).toBeInTheDocument();
    expect(screen.getByText("main-preview")).toBeInTheDocument();
  });

  it("Should render a spinner when showSpinner is true", () => {
    renderWithRouter(<DataList {...props} showSpinner={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});

describe("BucketsList list actions", () => {
  const props = {
    busy: false,
  };

  it("Should render a Create Bucket button when the user has permission", () => {
    canCreateBucket.mockReturnValue(true);
    renderWithRouter(<ListActions {...props} />);
    expect(screen.getByText("Create bucket")).toBeInTheDocument();
  });

  it("Should render no Create Bucket button when the user lacks permission", () => {
    canCreateBucket.mockReturnValue(false);
    renderWithRouter(<ListActions {...props} />);
    expect(screen.queryByText("Create bucket")).toBeNull();
  });
});
