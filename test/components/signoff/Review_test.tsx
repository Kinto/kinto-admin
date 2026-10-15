import { Review } from "@src/components/signoff/Review";
import * as groupHooks from "@src/hooks/group";
import * as sessionHooks from "@src/hooks/session";
import * as signoffHooks from "@src/hooks/signoff";
import { renderWithRouter } from "@test/testUtils";
import { screen, within } from "@testing-library/react";

const source = {
  bucket: "main-workspace",
  collection: "ms-images",
  isLoading: false,
  status: "to-review" as const,
  lastReviewRequestBy: "ldap:editor@mozilla.com",
  lastReviewRequestDate: 1755703164649,
};

function reviewElement(currentStep = 1) {
  return (
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

function renderReview(currentStep = 1) {
  return renderWithRouter(reviewElement(currentStep));
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
      .getByText("Suggested Reviewers")
      .closest("details")
      .querySelectorAll("ul li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("ldap:bob@mozilla.com, last reviewed");
    expect(items[1]).toHaveTextContent("ldap:alice@mozilla.com");
  });

  it("explains how to use the suggestions in a tooltip", () => {
    renderReview();
    expect(screen.getByText("Suggested Reviewers")).toHaveAttribute(
      "title",
      expect.stringContaining("reach out to one of these reviewers directly")
    );
  });

  it("does not suggest the user who requested the review", () => {
    renderReview();
    const reviewers = screen
      .getByText("Suggested Reviewers")
      .closest("details");
    expect(reviewers).not.toHaveTextContent("ldap:editor@mozilla.com");
  });

  it("shows the Suggested Reviewers dropdown while reviewers are loading", () => {
    vi.spyOn(signoffHooks, "useLatestApprovals").mockReturnValue(undefined);
    renderReview();
    const reviewers = screen
      .getByText("Suggested Reviewers")
      .closest("details");
    expect(within(reviewers).getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows the Suggested Reviewers dropdown while the reviewers group is loading", () => {
    vi.spyOn(groupHooks, "useGroup").mockReturnValue(undefined);
    renderReview();
    const reviewers = screen
      .getByText("Suggested Reviewers")
      .closest("details");
    expect(within(reviewers).getByTestId("spinner")).toBeInTheDocument();
  });

  it("fills in the same Suggested Reviewers dropdown once reviewers load", () => {
    const approvalsMock = vi
      .spyOn(signoffHooks, "useLatestApprovals")
      .mockReturnValue(undefined);
    const { rerender } = renderReview();
    const dropdownWhileLoading = screen
      .getByText("Suggested Reviewers")
      .closest("details");
    expect(
      within(dropdownWhileLoading).getByTestId("spinner")
    ).toBeInTheDocument();

    approvalsMock.mockReturnValue([
      { last_modified: 1755633782328, user_id: "ldap:bob@mozilla.com" },
    ]);
    rerender(reviewElement());
    const dropdownAfterLoading = screen
      .getByText("Suggested Reviewers")
      .closest("details");
    expect(dropdownAfterLoading).toBe(dropdownWhileLoading);
    expect(
      within(dropdownAfterLoading).queryByTestId("spinner")
    ).not.toBeInTheDocument();
    expect(dropdownAfterLoading).toHaveTextContent("ldap:bob@mozilla.com");
  });

  it("shows the Suggested Reviewers dropdown when there are no reviewers to suggest", () => {
    vi.spyOn(groupHooks, "useGroup").mockReturnValue({
      data: { id: "ms-images-reviewers", members: ["ldap:editor@mozilla.com"] },
    });
    renderReview();
    const reviewers = screen
      .getByText("Suggested Reviewers")
      .closest("details");
    expect(reviewers).toHaveTextContent("None");
  });

  it("does not show reviewers when not the current step", () => {
    renderReview(2);
    expect(screen.queryByText("Suggested Reviewers")).not.toBeInTheDocument();
  });
});
