import { Review } from "@src/components/signoff/Review";
import * as groupHooks from "@src/hooks/group";
import * as sessionHooks from "@src/hooks/session";
import * as signoffHooks from "@src/hooks/signoff";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

const source = {
  bucket: "main-workspace",
  collection: "ms-images",
  isLoading: false,
  status: "to-review" as const,
  lastReviewRequestBy: "ldap:editor@mozilla.com",
  lastReviewRequestDate: 1755703164649,
};

function renderReview(currentStep = 1) {
  return renderWithRouter(
    <Review
      label="Waiting review"
      canEdit={false}
      currentStep={currentStep}
      step={1}
      isCurrentUrl={true}
      source={source}
      preview={null}
      changes={null}
    />
  );
}

describe("Review", () => {
  beforeEach(() => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue({
      status: "success",
      data: {
        capabilities: {
          signer: {
            editors_group: "{collection_id}-editors",
            reviewers_group: "{collection_id}-reviewers",
          },
        },
      },
    } as any);
    vi.spyOn(groupHooks, "useGroup").mockReturnValue({
      data: {
        id: "ms-images-reviewers",
        members: [
          "ldap:editor@mozilla.com",
          "ldap:alice@mozilla.com",
          "ldap:bob@mozilla.com",
        ],
      },
    });
    vi.spyOn(signoffHooks, "useLatestApprovals").mockReturnValue([
      { last_modified: 1755633782328, user_id: "ldap:bob@mozilla.com" },
    ]);
  });

  it("lists suggested reviewers, recent approvers first", () => {
    renderReview();
    expect(groupHooks.useGroup).toHaveBeenCalledWith(
      "main-workspace",
      "ms-images-reviewers"
    );
    const items = screen
      .getByText("Suggested Reviewers:")
      .parentElement.querySelectorAll("ul li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("ldap:bob@mozilla.com, last reviewed");
    expect(items[1]).toHaveTextContent("ldap:alice@mozilla.com");
  });

  it("explains how to use the suggestions in a tooltip", () => {
    renderReview();
    expect(screen.getByText("Suggested Reviewers:")).toHaveAttribute(
      "title",
      expect.stringContaining("reach out to one of these reviewers directly")
    );
  });

  it("does not suggest the user who requested the review", () => {
    renderReview();
    const reviewers = screen.getByText("Suggested Reviewers:").parentElement;
    expect(reviewers).not.toHaveTextContent("ldap:editor@mozilla.com");
  });

  it("does not show reviewers when not the current step", () => {
    renderReview(2);
    expect(screen.queryByText("Suggested Reviewers:")).not.toBeInTheDocument();
  });
});
