import SimpleReviewSuggestedReviewers from "@src/components/signoff/SimpleReview/SimpleReviewSuggestedReviewers";
import * as reviewersHooks from "@src/hooks/reviewers";
import { render, screen } from "@testing-library/react";

const source = {
  bucket: "main-workspace",
  collection: "ms-images",
  isLoading: false,
  status: "to-review" as const,
  lastReviewRequestBy: "ldap:editor@mozilla.com",
};

describe("SimpleReviewSuggestedReviewers component", () => {
  it("lists suggested reviewers", () => {
    vi.spyOn(reviewersHooks, "useSuggestedReviewers").mockReturnValue([
      { id: "ldap:bob@mozilla.com", lastApproval: 1755633782328 },
      { id: "ldap:alice@mozilla.com" },
    ]);
    render(<SimpleReviewSuggestedReviewers source={source} />);
    const items = screen
      .getByTestId("simple-review-suggested-reviewers")
      .querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("ldap:bob@mozilla.com, last reviewed");
    expect(items[1]).toHaveTextContent("ldap:alice@mozilla.com");
  });

  it("explains how to use the suggestions in a tooltip", () => {
    vi.spyOn(reviewersHooks, "useSuggestedReviewers").mockReturnValue([]);
    render(<SimpleReviewSuggestedReviewers source={source} />);
    expect(screen.getByText("Suggested Reviewers")).toHaveAttribute(
      "title",
      expect.stringContaining("reach out to one of these reviewers directly")
    );
  });

  it("shows a spinner while reviewers are loading", () => {
    vi.spyOn(reviewersHooks, "useSuggestedReviewers").mockReturnValue(
      undefined
    );
    render(<SimpleReviewSuggestedReviewers source={source} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows None when there are no reviewers to suggest", () => {
    vi.spyOn(reviewersHooks, "useSuggestedReviewers").mockReturnValue([]);
    render(<SimpleReviewSuggestedReviewers source={source} />);
    expect(
      screen.getByTestId("simple-review-suggested-reviewers")
    ).toHaveTextContent("None");
  });
});
