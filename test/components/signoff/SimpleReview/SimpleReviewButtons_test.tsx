import SimpleReviewButtons from "@src/components/signoff/SimpleReview/SimpleReviewButtons";
import { renderWithProvider } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

function renderButtons(props = null) {
  const approveChanges = vi.fn();
  const declineChanges = vi.fn();
  const rollbackChanges = vi.fn();

  const mergedProps = {
    status: "to-review",
    approveChanges,
    declineChanges,
    rollbackChanges,
    ...props,
  };

  renderWithProvider(<SimpleReviewButtons {...mergedProps} />);
  return { approveChanges, declineChanges, rollbackChanges };
}

describe("SimpleReviewHeader component", () => {
  it("should call approveChanges when approve button is clicked", async () => {
    const { approveChanges } = renderButtons({
      status: "to-review",
      canReview: true,
    });

    fireEvent.click(screen.getByText(/Approve/));
    expect(approveChanges).toHaveBeenCalled();
    expect(await screen.findByTestId("spinner")).toBeDefined();
  });

  it("should open CommentDialog when reject is clicked call declineChanges from modal", async () => {
    const { declineChanges } = renderButtons({
      status: "to-review",
      canReview: true,
    });
    fireEvent.click(screen.getByText(/Decline/));
    fireEvent.click(await screen.findByText("Reject changes"));
    expect(declineChanges).toHaveBeenCalled();
    expect(await screen.findByTestId("spinner")).toBeDefined();
  });

  it.skip("should open CommentDialog when request review is clicked and call requestReview from modal", async () => {
    // TODO: What should this test do?
    // const { } = renderButtons({ status: "work-in-progress" });
  });

  it("should display rollback button when status is wip and call rollbackChanges from modal", async () => {
    const { rollbackChanges } = renderButtons({
      status: "work-in-progress",
      canRequestReview: true,
    });
    fireEvent.click(screen.getByText(/Rollback changes/));
    fireEvent.click(await screen.findByText("Rollback"));
    expect(rollbackChanges).toHaveBeenCalled();
    expect(await screen.findByTestId("spinner")).toBeDefined();
  });
});
