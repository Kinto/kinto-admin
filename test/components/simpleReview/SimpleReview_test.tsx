import { expect } from "chai";

import testUtils from "react-dom/test-utils";

import { createComponent } from "../../test_utils";
import SimpleReview, {
  SimpleReviewProps,
} from "../../../src/components/simpleReview/SimpleReview";

import { SessionState, BucketState } from "../../../src/types";

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
      bucket: {
        data: {
          id: "main-workspace",
        },
      },
      collection: {
        data: {
          id: "my-collection",
          status: "to-review",
        },
      },
      session: sessionFactory(),
      async fetchRecords() {},
      ...props,
    });
  });
  return node;
}

describe("SimpleTest component", () => {
  it("should render loading when authenticating", async () => {
    const node = await renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: true }),
    });
    expect(node.textContent).to.equal("Loading...");
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
    const node = await renderSimpleReview({
      bucket: {
        data: {
          id: "main", // reviewable buckets end in -workspace
        },
      } as BucketState,
    });
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
