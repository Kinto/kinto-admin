import SignoffToolBar from "../../../src/components/signoff/SignoffToolBar";
import * as React from "react";
import { render, fireEvent } from "@testing-library/react";

// to avoid rendering a router around everything, allows for more focused testing
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Link: "a",
  };
});

jest.mock("../../../src/hooks/storage", () => {
  const originalModule = jest.requireActual("../../../src/hooks/storage");
  return {
    __esModule: true,
    ...originalModule,
    useLocalStorage: jest.fn().mockReturnValue([false, jest.fn()]),
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
    requestReview: jest.fn(),
    confirmRequestReview: jest.fn(),
    approveChanges: jest.fn(),
    confirmRollbackChanges: jest.fn(),
    rollbackChanges: jest.fn(),
    declineChanges: jest.fn(),
    confirmDeclineChanges: jest.fn(),
    cancelPendingConfirm: jest.fn(),
  };

  it("should not be rendered if current collection is not listed in resources", () => {
    const node = render(<SignoffToolBar {...props} signoff={{}} />);
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
    const node = render(<SignoffToolBar {...propsOverride} />);
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
      approveChanges: jest.fn(),
    };
    const node = render(<SignoffToolBar {...propsOverride} />);
    expect(node.queryByTestId("spinner")).toBeNull();
    expect(propsOverride.approveChanges).toHaveBeenCalledTimes(0);
    fireEvent.click(await node.findByText("Approve"));
    expect(await node.findByTestId("spinner")).toBeDefined();
    expect(propsOverride.approveChanges).toHaveBeenCalledTimes(1);
  });
});
