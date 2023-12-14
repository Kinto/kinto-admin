import React from "react";
import { fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import { renderWithProvider, sessionFactory } from "../../../test_utils";
import SimpleReview from "../../../../src/components/signoff/SimpleReview";
import { useLocalStorage } from "../../../../src/hooks/storage";
import { Redirect, useHistory } from "react-router-dom";

jest.mock("../../../../src/hooks/storage", () => {
  const originalModule = jest.requireActual("../../../../src/hooks/storage");
  return {
    __esModule: true,
    ...originalModule,
    useLocalStorage: jest.fn().mockReturnValue([true, jest.fn()]),
  };
});

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  const pushMock = jest.fn();
  const useHistory = () => {
    return {
      push: pushMock,
    };
  };
  return {
    __esModule: true,
    ...originalModule,
    useHistory,
    Redirect: jest.fn().mockReturnValue(<div>foo</div>),
  };
});

jest.mock("../../../../src/permission", () => {
  return {
    canEditCollection: () => {
      return true;
    },
  };
});

jest.mock("../../../../src/components/signoff/utils", () => {
  return {
    isMember: () => {
      return true;
    },
  };
});

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
        lastReviewDate: 1622816256865,
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
    capabilities: {},
    collection: {
      totalRecords: 3,
    },
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
    async fetchRecords() {
      return [];
    },
    ...props,
    rollbackChanges: jest.fn(),
  };
  return renderWithProvider(<SimpleReview {...mergedProps} />);
}

const fakeLocation = {
  pathname: "/buckets/main-workspace/collections/test/simple-review",
  search: "",
  hash: "",
};

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

  it("should render not reviewable", async () => {
    const node = renderSimpleReview({ signoff: undefined });
    expect(node.getByText(/This collection does not support/).textContent).toBe(
      "This collection does not support reviews, or you do not have permission to review."
    );
  });

  it("should render a diff form for not a reviewer", async () => {
    const session = sessionFactory();
    session.serverInfo.user.principals = [];
    const node = renderSimpleReview({
      session,
    });
    await waitForElementToBeRemoved(() => node.queryByTestId("spinner"));
    expect(node.getByText(/Status is/).textContent).toBe(
      "Status is work-in-progress. "
    );
    expect(node.getByText("(No comment was left by a reviewer)")).toBeDefined();
    expect(node.getByText("Show all lines")).toBeDefined();
  });

  it("should render a review component after records are fetched and allow for a rollback", async () => {
    let node = renderSimpleReview({
      async fetchRecords() {
        return [];
      },
    });
    await waitForElementToBeRemoved(() => node.queryByTestId("spinner"));

    expect(node.findByTestId(".simple-review-header")).toBeDefined();

    // also check rollback calls history.push while we're here
    fireEvent.click(node.queryByText(/Rollback changes/));
    fireEvent.click(node.queryByText("Rollback"));
    expect(useHistory().push).toHaveBeenCalled();
  });

  it("should hide the rollback button if the hideRollback query parameter is provided", async () => {
    fakeLocation.search = "?hideRollback";
    let node = renderSimpleReview({
      async fetchRecords() {
        return [];
      },
    });
    await waitForElementToBeRemoved(() => node.queryByTestId("spinner"));

    expect(node.queryByText("Rollback")).toBeNull();
    fakeLocation.search = "";
  });

  it("Should not get stuck showing a spinner if signoff source fails to load", async () => {
    let node = renderSimpleReview({
      async fetchRecords() {
        return [];
      },
      signoff: {
        collectionsInfo: {
          source: {
            bid: "test",
            cid: "test",
          },
          destination: {
            bid: "test",
            cid: "test",
          },
        },
      },
    });
    await waitForElementToBeRemoved(() => node.queryByTestId("spinner"));
  });

  it("Should not get stuck showing a spinner fetchRecords throws an error", async () => {
    let node = renderSimpleReview({
      async fetchRecords() {
        const err = new Error("Test error");
        err.data = {
          code: 401,
        };
        throw err;
      },
    });
    await waitForElementToBeRemoved(() => node.queryByTestId("spinner"));
  });

  it("should redirect the user if the legacy review process is enabled", async () => {
    useLocalStorage.mockReturnValue([false, jest.fn()]);
    const session = sessionFactory();
    session.serverInfo.user.principals = [];
    renderSimpleReview({
      session,
    });
    expect(Redirect).toHaveBeenCalled();
  });
});
