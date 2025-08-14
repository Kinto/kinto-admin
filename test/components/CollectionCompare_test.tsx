import { CollectionCompare } from "@src/components/collection/CollectionCompare";
import { useBucketList } from "@src/hooks/bucket";
import { useCollectionList } from "@src/hooks/collection";
import { useRecordList } from "@src/hooks/record";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("@src/hooks/bucket", () => ({
  useBucketList: vi.fn(),
}));

vi.mock("@src/hooks/collection", () => ({
  useCollectionList: vi.fn(),
}));

vi.mock("@src/hooks/record", () => ({
  useRecordList: vi.fn(),
}));

vi.mock("../Spinner", () => ({
  __esModule: true,
  default: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("./CollectionTabs", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe("CollectionCompare", () => {
  const mockBuckets = [
    {
      id: "other-bucket",
    },
    {
      id: "main-bucket",
    },
  ];

  const mockCollections = {
    data: [
      {
        id: "col1",
      },
      {
        id: "col2",
      },
    ],
  };

  beforeEach(() => {
    useBucketList.mockReturnValue(mockBuckets);
    useCollectionList.mockReturnValue(mockCollections);
    useRecordList.mockImplementation((bid, cid) => {
      if (bid && cid) {
        return {
          data: [
            { id: `${bid}-${cid}-record-1` },
            { id: `${bid}-${cid}-record-2` },
          ],
        };
      }
      return { data: [] };
    });
  });

  it("should render loading spinner initially", () => {
    useBucketList.mockReturnValue(undefined);
    useCollectionList.mockReturnValue(mockCollections);
    renderWithRouter(<CollectionCompare />, {
      route: "/buckets/main-bucket/collections/main-collection/compare",
      path: "/buckets/:bid/collections/:cid/compare",
    });

    const bucket = screen.getByLabelText("Bucket");
    expect(bucket).toBeDisabled();
    expect(screen.getByText("⏳ Loading...")).toBeInTheDocument();
  });

  it("should render bucket list after loading", async () => {
    renderWithRouter(<CollectionCompare />, {
      route: "/buckets/main-bucket/collections/main-collection/compare",
      path: "/buckets/:bid/collections/:cid/compare",
    });

    await waitFor(() =>
      expect(screen.getByLabelText("Bucket")).toBeInTheDocument()
    );

    expect(screen.getByText("other-bucket")).toBeDefined();
    expect(screen.getByText("main-bucket")).toBeDefined();
  });

  it("should allow selecting a different bucket and collection", async () => {
    renderWithRouter(<CollectionCompare />, {
      route: "/buckets/main-bucket/collections/main-collection/compare",
      path: "/buckets/:bid/collections/:cid/compare",
    });

    const bucketSelect = await screen.findByLabelText("Bucket");
    fireEvent.change(bucketSelect, { target: { value: "other-bucket" } });

    const collectionSelect = await screen.findByLabelText("Collection");
    fireEvent.change(collectionSelect, { target: { value: "col2" } });

    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );

    expect(screen.queryAllByTestId("record-diff")).toBeDefined();
    expect(screen.getByText("other-bucket-col2-record-2")).toBeDefined();
  });

  it("should disable selection of same bucket/collection", async () => {
    renderWithRouter(<CollectionCompare />, {
      route: "/buckets/main-bucket/collections/main-collection/compare",
      path: "/buckets/:bid/collections/:cid/compare",
    });

    // Ensure the current route collection exists in the list so it can be disabled.
    useCollectionList.mockReturnValue({
      data: [{ id: "main-collection" }, { id: "col1" }],
    });

    const bucketSelect = await screen.findByLabelText("Bucket");
    fireEvent.change(bucketSelect, { target: { value: "main-bucket" } });

    await screen.findByLabelText("Collection");

    // The same collection should be disabled
    expect(
      screen.getByRole("option", { name: "main-collection" })
    ).toBeDisabled();
  });

  it("should show diff when both bucket and collection are selected", async () => {
    renderWithRouter(<CollectionCompare />, {
      route: "/buckets/main-bucket/collections/main-collection/compare",
      path: "/buckets/:bid/collections/:cid/compare",
    });

    const bucketSelect = await screen.findByLabelText("Bucket");
    fireEvent.change(bucketSelect, { target: { value: "other-bucket" } });

    const collectionSelect = await screen.findByLabelText("Collection");
    fireEvent.change(collectionSelect, { target: { value: "col1" } });

    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );

    expect(screen.queryAllByTestId("record-diff")).toBeDefined();
    expect(screen.getByText("other-bucket-col1-record-2")).toBeDefined();
  });

  it("should use target bucket and collection from URL", async () => {
    renderWithRouter(<CollectionCompare />, {
      route:
        "/buckets/main-bucket/collections/main-collection/compare?target=other-bucket/col1",
      path: "/buckets/:bid/collections/:cid/compare",
      initialEntries: [
        "/buckets/:bid/collections/:cid/compare?target=other-bucket/col1",
      ],
    });

    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );

    expect(screen.getByLabelText("Bucket")).not.toBeDisabled();
    expect(screen.getByLabelText("Collection")).not.toBeDisabled();
    expect(screen.queryAllByTestId("record-diff")).toBeDefined();
    expect(screen.getByText("other-bucket-col1-record-2")).toBeDefined();
  });

  it("should ignore target bucket and collection from URL if unknown", async () => {
    renderWithRouter(<CollectionCompare />, {
      route:
        "/buckets/main-bucket/collections/main-collection/compare?target=unknown/foo",
      path: "/buckets/:bid/collections/:cid/compare",
      initialEntries: [
        "/buckets/:bid/collections/:cid/compare?target=unknown/foo",
      ],
    });

    const bucket = screen.getByLabelText("Bucket");
    expect(bucket.value).toBe("");
    const collection = screen.getByLabelText("Collection");
    expect(collection.value).toBe("");
  });

  it("should disable dropdowns when loading records", async () => {
    useRecordList.mockImplementation((bid, cid) => undefined);
    renderWithRouter(<CollectionCompare />, {
      route:
        "/buckets/main-bucket/collections/main-collection/compare?target=other-bucket/col1",
      path: "/buckets/:bid/collections/:cid/compare",
      initialEntries: [
        "/buckets/:bid/collections/:cid/compare?target=other-bucket/col1",
      ],
    });
    expect(screen.getByLabelText("Bucket")).toBeDisabled();
    expect(screen.getByLabelText("Collection")).toBeDisabled();
    expect(screen.queryByTestId("spinner")).toBeInTheDocument();
  });
});
