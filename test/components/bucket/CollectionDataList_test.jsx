import React from "react";
import { renderWithProvider } from "../../testUtils";
import {
  DataList,
  ListActions,
} from "../../../src/components/bucket/CollectionDataList";
import { canCreateCollection } from "../../../src/permission";

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
      entries: [
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
      loaded: true,
      hasNextPage: false,
    },
  };
  it("Should render a list of collections as expected", () => {
    const result = renderWithProvider(<DataList {...props} />);
    expect(result.queryByText("test-collection-id")).toBeDefined();
    expect(result.queryByTitle("Browse collection")).toBeDefined();
    expect(result.queryByTitle("Edit collection attributes")).toBeDefined();
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
    const result = renderWithProvider(<ListActions {...props} />);
    expect(result.queryByText("Create collection")).toBeDefined();
  });

  it("Should render no Create Collection button when the user lacks permission", () => {
    canCreateCollection.mockReturnValue(false);
    const result = renderWithProvider(<ListActions {...props} />);
    expect(result.queryByText("Create collection")).toBeNull();
  });
});
