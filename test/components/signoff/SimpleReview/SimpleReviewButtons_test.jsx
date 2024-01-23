import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProvider } from "../../../testUtils";
import SimpleReviewButtons from "../../../../src/components/signoff/SimpleReview/SimpleReviewButtons";

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

  const node = renderWithProvider(<SimpleReviewButtons {...mergedProps} />);
  return { approveChanges, declineChanges, rollbackChanges, node };
}

describe("SimpleReviewHeader component", () => {
  it("should call approveChanges when approve button is clicked", async () => {
    const { approveChanges, node } = renderButtons({
      status: "to-review",
      canReview: true,
    });

    fireEvent.click(node.getByText(/Approve/));
    expect(approveChanges).toHaveBeenCalled();
    expect(await node.findByTestId("spinner")).toBeDefined();
  });

  it("should open CommentDialog when reject is clicked call declineChanges from modal", async () => {
    const { declineChanges, node } = renderButtons({
      status: "to-review",
      canReview: true,
    });
    fireEvent.click(node.getByText(/Decline/));
    fireEvent.click(await node.findByText("Reject changes"));
    expect(declineChanges).toHaveBeenCalled();
    expect(await node.findByTestId("spinner")).toBeDefined();
  });

  it("should open CommentDialog when request review is clicked and call requestReview from modal", async () => {
    const {} = renderButtons({ status: "work-in-progress" });
  });

  it("should display rollback button when status is wip and call rollbackChanges from modal", async () => {
    const { rollbackChanges, node } = renderButtons({
      status: "work-in-progress",
      canRequestReview: true,
    });
    fireEvent.click(node.getByText(/Rollback changes/));
    fireEvent.click(await node.findByText("Rollback"));
    expect(rollbackChanges).toHaveBeenCalled();
    expect(await node.findByTestId("spinner")).toBeDefined();
  });
});
