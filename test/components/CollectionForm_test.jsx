import React from "react";
import { render } from "@testing-library/react";
import CollectionForm from "../../src/components/collection/CollectionForm";

const warningText =
  "You don't have the required permission to edit this collection.";

const testProps = {
  cid: null,
  bid: "default",
  session: {
    permissions: [],
    buckets: [
      {
        id: "default",
      },
    ],
  },
  bucket: {
    busy: false,
    data: {
      id: "default",
    },
    permissions: {},
    groups: [],
  },
  collection: {
    busy: false,
    data: {},
    permissions: {},
    records: [],
  },
  deleteCollection: jest.fn(),
  onSubmit: jest.fn(),
  formData: undefined,
};

// to avoid rendering a router around everything, allows for easier testing
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Link: "a",
  };
});

describe("CollectionForm component", () => {
  beforeAll(() => {
    // preventing code mirror errors
    Range.prototype.getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    });
    Range.prototype.getClientRects = () => ({
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn(),
    });
  });

  it("Should render an editable form for a user with permissions creating a new collection", async () => {
    const localTestProps = JSON.parse(JSON.stringify(testProps));
    localTestProps.session.permissions.push({
      resource_name: "bucket",
      permissions: [
        "group:create",
        "read",
        "read:attributes",
        "collection:create",
      ],
      bucket_id: "default",
    });
    const result = render(<CollectionForm {...localTestProps} />);

    const warning = result.queryByText(warningText);
    expect(warning).toBeNull();
    const title = await result.findByLabelText("Collection id*");
    expect(title.disabled).toBe(false);
  });

  it("Should render an editable form for a user with permissions editing a collection", async () => {
    const localTestProps = JSON.parse(JSON.stringify(testProps));
    localTestProps.session.permissions.push({
      uri: "/buckets/default/test",
      resource_name: "collection",
      permissions: ["write"],
      id: "test",
      bucket_id: "default",
      collection_id: "test",
    });
    localTestProps.cid = "test";
    localTestProps.bid = "default";
    localTestProps.collection.data.id = "test";
    localTestProps.formData = {};

    const result = render(<CollectionForm {...localTestProps} />);

    const warning = result.queryByText(warningText);
    expect(warning).toBeNull();
    const title = await result.findByLabelText("Collection id*");
    expect(title.disabled).toBe(false);
  });

  it("Should render an error for a user lacking permissions creating a collection", async () => {
    const localTestProps = JSON.parse(JSON.stringify(testProps));
    localTestProps.session.permissions = [
      {
        uri: "/buckets/default",
        resource_name: "bucket",
        permissions: ["group:create", "read", "read:attributes", "write"],
        id: "default",
        bucket_id: "default",
      },
    ];
    const result = render(<CollectionForm {...localTestProps} />);

    const warning = await result.queryByText(warningText);
    expect(warning).toBeDefined();
    const title = await result.findByLabelText("Collection id*");
    expect(title.disabled).toBe(true);
  });

  it("Should render as read-only for a user lacking permissions editing a collection", async () => {
    const localTestProps = JSON.parse(JSON.stringify(testProps));
    localTestProps.collection = {
      busy: false,
      data: {
        id: "test",
      },
      permissions: {
        read: [],
        "record:create": [],
      },
      records: [],
    };
    localTestProps.cid = "test";
    localTestProps.bid = "default";
    localTestProps.formData = {};

    const result = render(<CollectionForm {...localTestProps} />);

    const warning = await result.queryByText(warningText);
    expect(warning).toBeDefined();
    const title = await result.findByLabelText("Collection id*");
    expect(title.disabled).toBe(true);
  });
});
