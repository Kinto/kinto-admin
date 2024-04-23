import SignoffToolBar from "@src/components/signoff/SignoffToolBar";
import { renderWithProvider } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("../../../src/permission", () => {
  return {
    canEditCollection: () => {
      return true;
    },
  };
});

vi.mock("../../../src/components/signoff/utils", () => {
  return {
    isMember: () => {
      return true;
    },
  };
});

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
            to_review_enabled: true,
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
    const { container } = renderWithProvider(
      <SignoffToolBar {...props} signoff={{}} />
    );
    expect(container.innerHTML).toBe("");
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
    renderWithProvider(<SignoffToolBar {...propsOverride} />);
    expect(screen.queryAllByText("Request review...")).toHaveLength(1);
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

    renderWithProvider(<SignoffToolBar {...propsOverride} />);
    expect(screen.queryByTestId("spinner")).toBeNull();
    expect(propsOverride.approveChanges).toHaveBeenCalledTimes(0);
    const approveButton = await screen.findByText("Approve");
    fireEvent.click(approveButton);
    expect(await screen.findByTestId("spinner")).toBeDefined();
    expect(propsOverride.approveChanges).toHaveBeenCalledTimes(1);
  });

  describe("to_review_enabled checks", () => {
    const propsOverride = {
      ...props,
      sessionState: {
        ...props.sessionState,
        serverInfo: {
          ...props.sessionState.serverInfo,
          capabilities: {
            ...props.sessionState.serverInfo.capabilities,
            signer: {
              ...props.sessionState.serverInfo.capabilities.signer,
              to_review_enabled: false,
              resources: [],
            },
          },
          user: {
            id: "fxa:yo",
            principals: [
              "fxa:yo",
              "/buckets/stage/groups/certs_editors",
              "/buckets/stage/groups/certs_reviewers",
            ],
          },
        },
      },
      signoff: {
        ...props.signoff,
        collectionsInfo: {
          source: {
            bid: "stage",
            cid: "certs",
            lastEditDate: 1524063083971,
            lastReviewRequestBy: "fxa:yo",
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
    };

    it("should show the review buttons if signer.to_review_enabled is false", async () => {
      renderWithProvider(<SignoffToolBar {...propsOverride} />);
      expect(await screen.findByText("Approve")).toBeDefined();
    });

    it("should not show the review buttons if signer.to_review_enabled is true and the current user requested review", async () => {
      propsOverride.sessionState.serverInfo.capabilities.signer.to_review_enabled =
        true;

      renderWithProvider(<SignoffToolBar {...propsOverride} />);
      expect(screen.queryByText("Approve")).toBeNull();
    });

    it("should show the review buttons if signer.resources.to_review_enabled is false", async () => {
      propsOverride.sessionState.serverInfo.capabilities.signer.resources = [
        {
          source: {
            bucket: propsOverride.signoff.collectionsInfo.source.bid,
            collection: propsOverride.signoff.collectionsInfo.source.cid,
          },
          destination: {
            bucket: propsOverride.signoff.collectionsInfo.destination.bid,
            collection: propsOverride.signoff.collectionsInfo.destination.cid,
          },
          to_review_enabled: false,
        },
      ];
      renderWithProvider(<SignoffToolBar {...propsOverride} />);
      expect(await screen.findByText("Approve")).toBeDefined();
    });
  });
});
