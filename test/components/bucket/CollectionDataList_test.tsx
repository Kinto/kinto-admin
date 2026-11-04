import {
  DataList,
  ListActions,
} from "@src/components/bucket/CollectionDataList";
import { canCreateCollection } from "@src/permission";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";

vi.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canCreateCollection: vi.fn(),
  };
});

describe("Bucket CollectionDataList", () => {
  const props = {
    bid: "test",
    capabilities: {},
    listBucketNextCollections: vi.fn(),
    collections: {
      data: [
        {
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                title: "Title",
                description: "Short title",
              },
              content: {
                type: "string",
                title: "Content",
                description: "Provide details...",
              },
            },
          },
          cache_expires: 0,
          uiSchema: {
            "ui:order": ["title", "content"],
            content: {
              "ui:widget": "textarea",
            },
          },
          sort: "-last_modified",
          displayFields: ["title"],
          attachment: {
            enabled: false,
            required: false,
          },
          id: "test-collection-id",
          last_modified: 1699985728831,
        },
      ],
      hasNextPage: false,
    },
  };
  it("Should render a list of collections as expected", () => {
    renderWithRouter(<DataList {...props} />);
    expect(screen.getByText("test-collection-id")).toBeInTheDocument();
    expect(screen.getByTitle("Browse collection")).toBeInTheDocument();
    expect(screen.getByTitle("Edit collection attributes")).toBeInTheDocument();
  });
  it("Should render a spinner when showSpinner is true", () => {
    renderWithRouter(<DataList {...props} showSpinner={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});

describe("Bucket CollectionListActions", () => {
  const props = {
    session: {
      busy: false,
    },
    bucket: {
      busy: false,
      data: {
        id: "test",
      },
    },
  };

  it("Should render a Create Collection button when the user has permission to create one", () => {
    canCreateCollection.mockReturnValue(true);
    renderWithRouter(<ListActions {...props} />);
    expect(screen.getByText("Create collection")).toBeInTheDocument();
  });

  it("Should render no Create Collection button when the user lacks permission", () => {
    canCreateCollection.mockReturnValue(false);
    renderWithRouter(<ListActions {...props} />);
    expect(screen.queryByText("Create collection")).toBeNull();
  });
});
