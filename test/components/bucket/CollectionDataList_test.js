import React from "react";
import { render } from "@testing-library/react";
import {
  DataList,
  ListActions,
} from "../../../src/components/bucket/CollectionDataList";
import { canCreateCollection } from "../../../src/permission";

jest.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canCreateCollection: jest.fn(),
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

describe("Bucket CollectionDataList", () => {
  const props = {
    bid: "test",
    capabilities: {},
    listBucketNextCollections: jest.fn(),
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
    const result = render(<DataList {...props} />);
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
        id: "test"
      }
    },
  };

  it("Should render a Create Collection button when the user has permission to create one", () => {
    canCreateCollection.mockReturnValue(true);
    const result = render(<ListActions {...props} />);
    expect(result.queryByText("Create collection")).toBeDefined();
  });

  it("Should render no Create Collection button when the user lacks permission", () => {
    canCreateCollection.mockReturnValue(false);
    const result = render(<ListActions {...props} />);
    expect(result.queryByText("Create collection")).toBeNull();
  });
});
