import { renderWithProvider } from "../../../test_utils";
import { fireEvent } from "@testing-library/react";
import * as React from "react";

import SimpleReviewButtons from "../../../../src/components/signoff/SimpleReview/SimpleReviewButtons";

function renderButtons(props = null) {
  const approveChanges = jest.fn();
  const declineChanges = jest.fn();
  const rollbackChanges = jest.fn();

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
  it("should call approveChanges when approve button is clicked", () => {
    const { approveChanges, node } = renderButtons({ status: "to-review" });

    fireEvent.click(node.getByText(/Approve/));
    expect(approveChanges).toHaveBeenCalled();
  });

  it("should open CommentDialog when reject is clicked call declineChanges from modal", async () => {
    const { declineChanges, node } = renderButtons({ status: "to-review" });
    fireEvent.click(node.getByText(/Decline/));
    fireEvent.click(await node.findByText("Reject changes"));
    expect(declineChanges).toHaveBeenCalled();
  });

  it("should open CommentDialog when request review is clicked and call requestReview from modal", async () => {
    const {} = renderButtons({ status: "work-in-progress" });
  });

  it("should display rollback button when status is wip and call rollbackChanges from modal", async () => {
    const { rollbackChanges, node } = renderButtons({
      status: "work-in-progress",
      canReview: true,
    });
    fireEvent.click(node.getByText(/Rollback changes/));
    fireEvent.click(await node.findByText("Rollback"));
    expect(rollbackChanges).toHaveBeenCalled();
  });
});
