import * as React from "react";
import { renderWithProvider, sessionFactory } from "../../../test_utils";
import SimpleReview from "../../../../src/components/signoff/SimpleReview";

function signoffFactory() {
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

function renderSimpleReview(props = null) {
  const mergedProps = {
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
  };
  return renderWithProvider(<SimpleReview {...mergedProps} />);
}

const fakeLocation = {
  pathname: "/buckets/main-workspace/collections/test/simple-review",
  search: "",
  hash: "",
};

jest.mock("react-router", () => {
  const originalModule = jest.requireActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useLocation: () => {
      return fakeLocation;
    },
  };
});

describe("SimpleTest component", () => {
  it("should render spinner when authenticating", async () => {
    const node = renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: true }),
    });
    expect(node.queryByTestId("spinner")).toBeDefined();
  });

  it("should render not authenticated", async () => {
    const node = renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: false }),
    });
    expect(node.container.textContent).toBe("Not authenticated");
  });

  it("should render not authenticated", async () => {
    const node = renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: false }),
    });
    expect(node.container.textContent).toBe("Not authenticated");
  });

  it("should render not reviewable", async () => {
    const node = renderSimpleReview({ signoff: undefined });
    expect(node.container.textContent).toBe(
      "This is not a collection that supports reviews."
    );
  });

  it("should render not a reviewer", async () => {
    const session = sessionFactory();
    session.serverInfo.user.principals = [];
    const node = renderSimpleReview({
      session,
    });
    expect(node.container.textContent).toMatch(
      /You do not have review permissions/
    );
  });

  it("should render a review component after records are fetched", async () => {
    let node = renderSimpleReview({
      async fetchRecords() {
        return [];
      },
    });

    expect(node.queryByText("Rollback")).toBeDefined();
    expect(node.container.querySelector(".simple-review-header")).toBeDefined();
  });

  it("should hide the rollback button if the hideRollback query parameter is provided", async () => {
    fakeLocation.search = "?hideRollback";
    let node = renderSimpleReview({
      async fetchRecords() {
        return [];
      },
    });

    expect(node.queryByText("Rollback")).toBeNull();
    fakeLocation.search = "";
  });
});
