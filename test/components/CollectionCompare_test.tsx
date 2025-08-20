import { CollectionCompare } from "@src/components/collection/CollectionCompare";
import { SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES } from "@src/constants";
import * as bucketHooks from "@src/hooks/bucket";
import * as collectionHooks from "@src/hooks/collection";
import * as recordHooks from "@src/hooks/record";
import * as sessionHooks from "@src/hooks/session";
import * as signoffHooks from "@src/hooks/signoff";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";

describe("CollectionCompare", () => {
  const mockBucketList = vi.fn();
  const mockCollectionList = vi.fn();
  const mockUseServerInfo = vi.fn();
  const mockUseLatestApprovals = vi.fn();

  beforeEach(() => {
    const recordsMock = (bid, cid) => {
      if (!bid || !cid) return undefined;
      return {
        data: [
          { id: `${bid}-${cid}-record-1` },
          { id: `${bid}-${cid}-record-2` },
        ],
      } as any;
    };
    vi.spyOn(sessionHooks, "useServerInfo").mockImplementation(
      mockUseServerInfo
    );
    mockUseServerInfo.mockReturnValue(
      SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES
    );
    vi.spyOn(recordHooks, "useRecordList").mockImplementation(recordsMock);
    vi.spyOn(recordHooks, "useRecordListAt").mockImplementation(recordsMock);
    vi.spyOn(signoffHooks, "useLatestApprovals").mockImplementation(
      mockUseLatestApprovals
    );
    vi.spyOn(bucketHooks, "useBucketList").mockImplementation(mockBucketList);
    vi.spyOn(collectionHooks, "useCollectionList").mockImplementation(
      mockCollectionList
    );
    mockBucketList.mockReturnValue([
      {
        id: "other-bucket",
      },
      {
        id: "main-bucket",
      },
    ]);
    mockCollectionList.mockReturnValue({
      data: [
        {
          id: "col1",
        },
        {
          id: "col2",
        },
      ],
    });
    mockUseLatestApprovals.mockReturnValue([1755703164649, 1755633782328]);
  });

  it("should render loading spinner initially", () => {
    mockBucketList.mockReturnValue(undefined);
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
    vi.spyOn(recordHooks, "useRecordList").mockImplementation(
      (bid, cid) => undefined
    );
    vi.spyOn(recordHooks, "useRecordListAt").mockImplementation(
      (bid, cid) => undefined
    );
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

  it("should disable timestamp if history is disabled for this collection", async () => {
    mockUseServerInfo.mockReturnValue({
      ...SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES,
      capabilities: {
        ...SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES.capabilities,
        history: {
          excluded_resources: [{ bucket: "other-bucket" }],
        },
      },
    });
    renderWithRouter(<CollectionCompare />, {
      route:
        "/buckets/main-bucket/collections/main-collection/compare?target=other-bucket/col1",
      path: "/buckets/:bid/collections/:cid/compare",
      initialEntries: [
        "/buckets/:bid/collections/:cid/compare?target=other-bucket/col1",
      ],
    });
    expect(screen.getByTestId("timestampSelect")).toBeDisabled();
    expect(screen.getByTestId("timestampSelect")).toHaveAttribute(
      "title",
      "History is disabled for this collection"
    );
  });

  it("should empty the timestamp value if history is disabled for the selected collection", async () => {
    mockUseServerInfo.mockReturnValue({
      ...SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES,
      capabilities: {
        ...SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES.capabilities,
        history: {
          excluded_resources: [{ bucket: "other-bucket" }],
        },
      },
    });
    renderWithRouter(<CollectionCompare />, {
      route:
        "/buckets/main-bucket/collections/main-collection/compare?target=other-bucket/col1@1420070400100",
      path: "/buckets/:bid/collections/:cid/compare",
      initialEntries: [
        "/buckets/:bid/collections/:cid/compare?target=other-bucket/col1@1420070400100",
      ],
    });
    expect(screen.getByTestId("timestampSelect")).toBeDisabled();
    expect(screen.getByTestId("timestampSelect")).toHaveValue("");
  });

  it("should empty timestamp value when collection is changed", async () => {
    renderWithRouter(<CollectionCompare />, {
      route:
        "/buckets/main-bucket/collections/main-collection/compare?target=other-bucket/col1@1420070400100",
      path: "/buckets/:bid/collections/:cid/compare",
      initialEntries: [
        "/buckets/:bid/collections/:cid/compare?target=other-bucket/col1@1420070400100",
      ],
    });

    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("timestampSelect")).toHaveValue("1420070400100");

    const collectionSelect = await screen.findByLabelText("Collection");
    fireEvent.change(collectionSelect, { target: { value: "col2" } });

    expect(screen.getByTestId("timestampSelect")).toHaveValue("");
  });

  it("should set the input value when picked from latest approvals", async () => {
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

    const latestApproval = screen.getByTestId("input-dropdown-button");
    fireEvent.click(latestApproval);

    const choice = screen.getByTestId("input-dropdown-item-1755703164649");
    expect(choice).toBeVisible();
    fireEvent.click(choice);

    expect(screen.getByTestId("timestampSelect")).toHaveValue("1755703164649");
  });
});
