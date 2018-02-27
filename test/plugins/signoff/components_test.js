import { expect } from "chai";

import { createSandbox, createComponent } from "../../test_utils";
import SignoffToolBar from "../../../src/plugins/signoff/components";

describe("SignoffToolBar component", () => {
  let sandbox;

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
      groups: [
        {
          id: "reviewers",
          members: [],
        },
        {
          id: "certs_editors",
          members: ["fxa:yo"],
        },
      ],
    },
    collectionState: {
      data: { id: "certs" },
    },
    signoff: {
      collections: {
        source: {
          bid: "stage",
          cid: null,
          changes: {
            lastUpdated: 42,
          },
        },
        destination: {
          bid: "prod",
          cid: null,
        },
      },
    },
    requestReview: () => {},
    confirmRequestReview: () => {},
    approveChanges: () => {},
    declineChanges: () => {},
    confirmDeclineChanges: () => {},
    cancelPendingConfirm: () => {},
  };

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should not be rendered if current collection is not listed in resources", () => {
    const node = createComponent(SignoffToolBar, {
      ...props,
      signoff: {},
    });
    expect(node).eql(null);
  });

  it("should show the request review button if current user is editor", () => {
    // Let's connect as `fxa:yo`. It's member of the certs_editors group.
    // As the group is configured with a placeholder on the server, the group
    // name is resolved with the current collection.
    const node = createComponent(SignoffToolBar, {
      ...props,
      sessionState: {
        ...props.sessionState,
        serverInfo: {
          ...props.sessionState.serverInfo,
          user: {
            id: "fxa:yo",
          },
        },
      },
    });
    expect(node.querySelectorAll("button.request-review")).to.have.length.of(1);
  });
});
