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
    requestReview: () => {},
    confirmRequestReview: () => {},
    approveChanges: () => {},
    confirmRollbackChanges: () => {},
    rollbackChanges: () => {},
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

  it("should show the request review button if current user has write access", () => {
    const node = createComponent(SignoffToolBar, props);
    expect(node.querySelectorAll("button.request-review")).to.have.a.lengthOf(
      1
    );
  });
});
