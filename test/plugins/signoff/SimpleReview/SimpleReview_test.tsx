import { expect } from "chai";

import testUtils from "react-dom/test-utils";

import { createComponent } from "../../../test_utils";
import SimpleReview, {
  SimpleReviewProps,
} from "../../../../src/plugins/signoff/SimpleReview/SimpleReview";

import { SessionState } from "../../../../src/types";
import { SignoffState } from "../../../../src/plugins/signoff/types";

function signoffFactory(): SignoffState {
  return {
    collectionsInfo: {
      source: {
        bid: "main-workspace",
        cid: "my-collection",
        editors_group: "{collection_id}-editors",
        reviewers_group: "{collection_id}-reviewers",
        lastEditBy: "account:experimenter",
        lastEditDate: 1622816256864,
        lastEditorComment: undefined,
        lastReviewBy: undefined,
        lastReviewDate: NaN,
        lastReviewRequestBy: undefined,
        lastReviewRequestDate: NaN,
        lastReviewerComment: undefined,
        lastSignatureBy: "account:admin",
        lastSignatureDate: 1622816219752,
        status: "work-in-progress",
      },
      destination: {
        bid: "main",
        cid: "my-collection",
      },
      preview: {
        bid: "main-preview",
        cid: "my-collection",
      },
    },
    pendingConfirmReviewRequest: false,
    pendingConfirmDeclineChanges: false,
    pendingConfirmRollbackChanges: false,
  };
}

function sessionFactory(props: Partial<SessionState> = null): SessionState {
  return {
    busy: false,
    authenticating: false,
    auth: {
      authType: "basicauth",
      server: "asdasd",
      credentials: {
        username: "user",
        password: "123",
      },
    },
    authenticated: true,
    permissions: [],
    buckets: [],
    serverInfo: {
      url: "",
      project_name: "foo",
      project_docs: "foo",
      capabilities: {},
      user: {
        id: "user1",
        principals: [`/buckets/main-workspace/groups/my-collection-reviewers`],
      },
    },
    ...props,
    redirectURL: "",
  };
}

async function renderSimpleReview(props: Partial<SimpleReviewProps> = null) {
  let node: HTMLElement;
  await testUtils.act(async () => {
    node = createComponent(SimpleReview, {
      match: {
        params: {
          bid: "main-workspace",
          cid: "my-collection",
        },
      },
      listRecords() {},
      session: sessionFactory(),
      signoff: signoffFactory(),
      async fetchRecords() {},
      ...props,
    });
  });
  return node;
}

describe("SimpleTest component", () => {
  it("should render spinner when authenticating", async () => {
    const node = await renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: true }),
    });
    expect(node.querySelector(".spinner")).to.be.ok;
  });

  it("should render not authenticated", async () => {
    const node = await renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: false }),
    });
    expect(node.textContent).to.equal("Not authenticated");
  });

  it("should render not authenticated", async () => {
    const node = await renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: false }),
    });
    expect(node.textContent).to.equal("Not authenticated");
  });

  it("should render not reviewable", async () => {
    const node = await renderSimpleReview({ signoff: undefined });
    expect(node.textContent).to.equal(
      "This is not a collection that supports reviews."
    );
  });

  it("should render not a reviewer", async () => {
    const session = sessionFactory();
    session.serverInfo.user.principals = [];
    const node = await renderSimpleReview({
      session,
    });
    expect(node.textContent).to.match(/You do not have review permissions/);
  });

  it("should render a review component after records are fetched", async () => {
    let node = await renderSimpleReview({
      async fetchRecords() {
        return [];
      },
    });

    expect(node.querySelector(".simple-review-header")).to.be.ok;
  });
});
