import SignoffToolBar from "../../../src/components/signoff/SignoffToolBar";
import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProvider } from "../../test_utils";

describe("SignoffToolBar component", () => {
  const props = {
    sessionState: {
      permissions: [
        {
          bucket_id: "stage",
          resource_name: "bucket",
          permissions: ["write"],
        },
      ],
      serverInfo: {
        capabilities: {
          history: {},
          signer: {
            reviewers_group: "reviewers",
            editors_group: "{collection_id}_editors",
          },
        },
      },
    },
    bucketState: {
      data: { id: "stage" },
    },
    collectionState: {
      data: { id: "certs" },
    },
    signoff: {
      collectionsInfo: {
        source: {
          bid: "stage",
          cid: "certs",
          lastEditDate: 1524063083971,
          changes: {
            lastUpdated: 42,
          },
        },
        destination: {
          bid: "prod",
          cid: "certs",
        },
      },
    },
    requestReview: vi.fn(),
    confirmRequestReview: vi.fn(),
    approveChanges: vi.fn(),
    confirmRollbackChanges: vi.fn(),
    rollbackChanges: vi.fn(),
    declineChanges: vi.fn(),
    confirmDeclineChanges: vi.fn(),
    cancelPendingConfirm: vi.fn(),
  };

  it("should not be rendered if current collection is not listed in resources", () => {
    const node = renderWithProvider(<SignoffToolBar {...props} signoff={{}} />);
    expect(node.container.innerHTML).toBe("");
  });

  it("should show the request review button if current user is editor", () => {
    // As the group is configured with a placeholder on the server, the group
    // name is resolved with the current collection.
    const propsOverride = {
      ...props,
      sessionState: {
        ...props.sessionState,
        serverInfo: {
          ...props.sessionState.serverInfo,
          user: {
            id: "fxa:yo",
            principals: ["fxa:yo", "/buckets/stage/groups/certs_editors"],
          },
        },
      },
    };
    const node = renderWithProvider(<SignoffToolBar {...propsOverride} />);
    expect(node.queryAllByText("Request review...")).toHaveLength(1);
  });

  it("should show a spinner when the user clicks approve to prevent further changes", async () => {
    // As the group is configured with a placeholder on the server, the group
    // name is resolved with the current collection.
    const propsOverride = {
      ...props,
      sessionState: {
        ...props.sessionState,
        serverInfo: {
          ...props.sessionState.serverInfo,
          user: {
            id: "fxa:yo",
            principals: [
              "fxa:yo",
              "/buckets/stage/groups/certs_editors",
              "/buckets/stage/groups/reviewers",
            ],
          },
        },
      },
      signoff: {
        collectionsInfo: {
          source: {
            bid: "stage",
            cid: "certs",
            lastEditDate: 1524063083971,
            changes: {
              lastUpdated: 42,
            },
            status: "to-review",
          },
          destination: {
            bid: "prod",
            cid: "certs",
          },
        },
      },
      approveChanges: vi.fn(),
    };

    localStorage.setItem("useSimpleReview", false);

    const node = renderWithProvider(<SignoffToolBar {...propsOverride} />);
    expect(node.queryByTestId("spinner")).toBeNull();
    expect(propsOverride.approveChanges).toHaveBeenCalledTimes(0);
    const approveButton = (await node.findByText("Approve"))
    fireEvent.click(approveButton);
    expect(await node.findByTestId("spinner")).toBeDefined();
    expect(propsOverride.approveChanges).toHaveBeenCalledTimes(1);
  });
});
