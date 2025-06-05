import * as client from "@src/client";
import SimpleReview from "@src/components/signoff/SimpleReview";
import { toReviewEnabled } from "@src/components/signoff/utils";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as collectionHooks from "@src/hooks/collection";
import * as recordHooks from "@src/hooks/record";
import * as sessionHooks from "@src/hooks/session";
import * as signoffHooks from "@src/hooks/signoff";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("@src/permission", () => {
  return {
    canEditCollection: () => {
      return true;
    },
  };
});

vi.mock("@src/components/signoff/utils", () => {
  return {
    isMember: () => {
      return true;
    },
    toReviewEnabled: vi.fn(),
  };
});

function signoffFactory() {
  return {
    source: {
      bucket: "main-workspace",
      collection: "my-collection",
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
      bucket: "main",
      collection: "my-collection",
    },
    preview: {
      bucket: "main-preview",
      collection: "my-collection",
    },
  };
}

function renderSimpleReview({
  serverInfo = DEFAULT_SERVERINFO,
  auth = {
    authtYPE: "basicauth",
    server: "server",
    credentials: {
      username: "user",
      password: "123",
    },
  },
  signoff = signoffFactory(),
  newRecords = [],
  oldRecords = [],
  search = "",
  setDataMock = vitest.fn(),
}) {
  // to mock
  // useCollection
  // useSignoff
  // useNavigate
  // useRecordList, both for new records and old records
  // getClient
  vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
    id: signoff.source.collection,
    last_modified: 1,
  });
  vi.spyOn(signoffHooks, "useSignoff").mockReturnValue(signoff);
  vi.spyOn(recordHooks, "useRecordList").mockImplementation((bid, cid) => {
    let list = newRecords;
    if (bid == signoff.destination.bucket) {
      list = oldRecords;
    }
    return {
      data: list,
      hasNextPage: false,
      lastModified: 0,
      totalRecords: list.length,
    };
  });
  vi.spyOn(sessionHooks, "useAuth").mockReturnValue(auth);
  vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(serverInfo);
  vi.spyOn(client, "getClient").mockReturnValue({
    bucket: bid => {
      return {
        collection: cid => {
          return {
            setData: setDataMock,
          };
        },
      };
    },
  });

  return renderWithRouter(<SimpleReview />, {
    route: `/main-workspace/my-collection${search}`,
    path: "/:bid/:cid",
  });
}

describe("SimpleTest component", () => {
  beforeEach(async () => {
    localStorage.setItem("useSimpleReview", true);
  });

  it("should render spinner when authenticating", async () => {
    renderSimpleReview({
      auth: null,
    });
    expect(screen.findByTestId("spinner")).toBeDefined();
  });

  it("should render spinner when session is busy", async () => {
    renderSimpleReview({
      serverInfo: null,
    });
    expect(screen.findByTestId("spinner")).toBeDefined();
  });

  it("should render spinner when records are still loading", async () => {
    vi.spyOn(recordHooks, "useRecordList").mockReturnValue({});
    renderSimpleReview({});
    expect(screen.findByTestId("spinner")).toBeDefined();
  });

  it("should render not authenticated", async () => {
    renderSimpleReview({
      auth: null,
    });
    expect(await screen.findByText("Not authenticated")).toBeVisible();
  });

  it("should render not reviewable", async () => {
    renderSimpleReview({
      signoff: {
        source: {},
        destination: {},
      },
    });
    expect(
      (await screen.findByText(/This collection does not support/)).textContent
    ).toBe(
      "This collection does not support reviews, or you do not have permission to review."
    );
  });

  it("should render a diff form for not a reviewer", async () => {
    renderSimpleReview({
      serverInfo: {
        capabilities: {
          signer: true,
        },
        user: {
          principals: [],
        },
      },
    });
    expect(screen.getByText(/Status is/).textContent).toBe(
      "Status is work-in-progress. "
    );
    expect(
      screen.getByText("(No comment was left by a reviewer)")
    ).toBeDefined();
    expect(screen.getByText("Show all lines")).toBeDefined();
  });

  it("should render a review component after records are fetched and allow for a rollback", async () => {
    const setDataMock = vitest.fn();
    renderSimpleReview({
      setDataMock,
    });
    expect(await screen.findByTestId("simple-review-header")).toBeDefined();

    // also check rollback calls history.push while we're here
    fireEvent.click(screen.queryByText(/Rollback changes/));
    fireEvent.click(screen.queryByText("Rollback"));
    expect(setDataMock).toHaveBeenCalledWith(
      {
        status: "to-rollback",
        last_editor_comment: "",
      },
      {
        safe: true,
        patch: true,
        last_modified: 1,
      }
    );
  });

  it("should hide the rollback button if the hideRollback query parameter is provided", async () => {
    renderSimpleReview({
      search: "?hideRollback",
    });
    expect(screen.queryByText("Rollback")).toBeNull();
  });

  it("Should not get stuck showing a spinner if signoff source fails to load", async () => {
    renderSimpleReview({
      signoff: {
        source: {
          bucket: "test",
          collection: "test",
        },
        destination: {
          bucket: "test",
          collection: "test",
        },
      },
    });
    expect(screen.queryByTestId("spinner")).toBeNull();
  });

  it("should redirect the user if the legacy review process is enabled", async () => {
    localStorage.setItem("useSimpleReview", false);
    renderSimpleReview({
      serverInfo: {
        capabilities: {
          signer: true,
        },
        user: {
          principals: [],
        },
      },
    });

    // Since Simple Review is the default, this means we're in the legacy UI
    expect(screen.findByText("Switch to Default Review UI")).toBeDefined();
  });

  describe("to_review_enabled checks", () => {
    const signoff = {
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
    };

    it("should show the review buttons if to_review_enabled is false", async () => {
      renderSimpleReview({
        signoff,
      });
      toReviewEnabled.mockReturnValue(false);
      expect(await screen.findByText(/Approve/)).toBeDefined();
    });

    it("should not show the review buttons if signer.to_review_enabled is true and the current user requested review", async () => {
      toReviewEnabled.mockReturnValue(true);
      renderSimpleReview({
        signoff,
        serverInfo: {
          capabilities: {
            signer: true,
          },
          user: {
            id: "user1",
          },
        },
      });
      expect(screen.queryByText(/Approve/)).toBeNull();
    });
  });
});
