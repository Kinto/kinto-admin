import React from "react";
import { renderWithProvider } from "../../testUtils";
import { screen } from "@testing-library/react";
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
    renderWithProvider(<DataList {...props} />);
    expect(screen.queryByText("test-collection-id")).toBeDefined();
    expect(screen.queryByTitle("Browse collection")).toBeDefined();
    expect(screen.queryByTitle("Edit collection attributes")).toBeDefined();
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
    renderWithProvider(<ListActions {...props} />);
    expect(screen.queryByText("Create collection")).toBeDefined();
  });

  it("Should render no Create Collection button when the user lacks permission", () => {
    canCreateCollection.mockReturnValue(false);
    renderWithProvider(<ListActions {...props} />);
    expect(screen.queryByText("Create collection")).toBeNull();
  });
});
