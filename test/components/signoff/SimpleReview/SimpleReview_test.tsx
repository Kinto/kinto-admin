import SimpleReview from "@src/components/signoff/SimpleReview";
import { toReviewEnabled } from "@src/components/signoff/utils";
import { renderWithProvider, sessionFactory } from "@test/testUtils";
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { createMemoryHistory } from "history/";
import React from "react";

vi.mock("../../../../src/permission", () => {
  return {
    canEditCollection: () => {
      return true;
    },
  };
});

const rollbackChangesMock = vi.fn();

vi.mock("../../../../src/components/signoff/utils", () => {
  return {
    isMember: () => {
      return true;
    },
    toReviewEnabled: vi.fn(),
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

function renderSimpleReview(props = null, renderProps = {}) {
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
    rollbackChanges: rollbackChangesMock,
  };
  return renderWithProvider(<SimpleReview {...mergedProps} />, {
    ...renderProps,
  });
}

const fakeLocation = {
  pathname: "/buckets/main-workspace/collections/test/simple-review",
  search: "",
  hash: "",
};

describe("SimpleTest component", () => {
  beforeEach(async () => {
    localStorage.setItem("useSimpleReview", true);
  });

  it("should render spinner when authenticating", async () => {
    renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: true }),
    });
    expect(screen.queryByTestId("spinner")).toBeDefined();
  });

  it("should render not authenticated", async () => {
    renderSimpleReview({
      session: sessionFactory({ authenticated: false, authenticating: false }),
    });
    expect(await screen.findByText("Not authenticated")).toBeVisible();
  });

  it("should render not reviewable", async () => {
    renderSimpleReview({ signoff: undefined });
    expect(
      screen.getByText(/This collection does not support/).textContent
    ).toBe(
      "This collection does not support reviews, or you do not have permission to review."
    );
  });

  it("should render a diff form for not a reviewer", async () => {
    const session = sessionFactory();
    session.serverInfo.user.principals = [];
    renderSimpleReview({
      session,
    });
    await waitForElementToBeRemoved(() => screen.queryByTestId("spinner"));
    expect(screen.getByText(/Status is/).textContent).toBe(
      "Status is work-in-progress. "
    );
    expect(
      screen.getByText("(No comment was left by a reviewer)")
    ).toBeDefined();
    expect(screen.getByText("Show all lines")).toBeDefined();
  });

  it("should render a review component after records are fetched and allow for a rollback", async () => {
    const history = createMemoryHistory({ initialEntries: ["/"] });
    renderSimpleReview(null, { initialHistory: history });
    const historyPushSpy = vi.spyOn(history, "push");

    await waitForElementToBeRemoved(() => screen.queryByTestId("spinner"));
    expect(await screen.findByTestId("simple-review-header")).toBeDefined();

    // also check rollback calls history.push while we're here
    fireEvent.click(screen.queryByText(/Rollback changes/));
    fireEvent.click(screen.queryByText("Rollback"));
    expect(rollbackChangesMock).toHaveBeenCalled();
    expect(historyPushSpy).toHaveBeenCalled();
  });

  it("should hide the rollback button if the hideRollback query parameter is provided", async () => {
    fakeLocation.search = "?hideRollback";
    renderSimpleReview({
      async fetchRecords() {
        return [];
      },
    });
    await waitForElementToBeRemoved(() => screen.queryByTestId("spinner"));

    expect(screen.queryByText("Rollback")).toBeNull();
    fakeLocation.search = "";
  });

  it("Should not get stuck showing a spinner if signoff source fails to load", async () => {
    renderSimpleReview({
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
    await waitForElementToBeRemoved(() => screen.queryByTestId("spinner"));
  });

  it("Should not get stuck showing a spinner fetchRecords throws an error", async () => {
    renderSimpleReview({
      async fetchRecords() {
        const err = new Error("Test error");
        err.data = {
          code: 401,
        };
        throw err;
      },
    });
    await waitForElementToBeRemoved(() => screen.queryByTestId("spinner"));
  });

  it("should redirect the user if the legacy review process is enabled", async () => {
    localStorage.setItem("useSimpleReview", false);
    const session = sessionFactory();
    session.serverInfo.user.principals = [];
    renderSimpleReview({ session });

    // Since Simple Review is the default, this means we're in the legacy UI
    expect(screen.queryByText("Switch to Default Review UI")).toBeDefined();
  });

  describe("to_review_enabled checks", () => {
    const signoff = {
      collectionsInfo: {
        source: {
          bid: "stage",
          cid: "certs",
          lastEditDate: 1524063083971,
          lastReviewRequestBy: "user1",
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
    };

    it("should show the review buttons if to_review_enabled is false", async () => {
      renderSimpleReview({
        session: sessionFactory(),
        signoff,
      });
      toReviewEnabled.mockReturnValue(false);
      await waitForElementToBeRemoved(() => screen.queryByTestId("spinner"));
      expect(await screen.findByText(/Approve/)).toBeDefined();
    });

    it("should not show the review buttons if signer.to_review_enabled is true and the current user requested review", async () => {
      toReviewEnabled.mockReturnValue(true);
      renderSimpleReview({
        session: sessionFactory(),
        signoff,
      });
      await waitForElementToBeRemoved(() => screen.queryByTestId("spinner"));
      expect(screen.queryByText(/Approve/)).toBeNull();
    });
  });
});
