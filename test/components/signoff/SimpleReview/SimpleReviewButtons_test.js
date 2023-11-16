import { expect } from "chai";
import { createComponent } from "../../../test_utils";
import ReactDomTestUtils from "react-dom/test-utils";
import sinon from "sinon";
import * as React from "react";

import SimpleReviewButtons from "../../../../src/components/signoff/SimpleReview/SimpleReviewButtons";

function renderButtons(props = null) {
  const approveChanges = sinon.stub();
  const declineChanges = sinon.stub();
  const rollbackChanges = sinon.stub();

  const mergedProps = {
    status: "to-review",
    approveChanges,
    declineChanges,
    rollbackChanges,
    ...props,
  };

  const node = createComponent(<SimpleReviewButtons {...mergedProps} />);
  return { approveChanges, declineChanges, rollbackChanges, node };
}

describe("SimpleReviewHeader component", () => {
  it("should call approveChanges when approve button is clicked", () => {
    const { approveChanges, node } = renderButtons({ status: "to-review" });

    ReactDomTestUtils.Simulate.click(node.querySelector(".btn-success"));
    expect(approveChanges.firstCall).to.be.ok;
  });

  it("should open CommentDialog when reject is clicked call declineChanges from modal", async () => {
    const { declineChanges, node } = renderButtons({ status: "to-review" });
    ReactDomTestUtils.act(() => {
      ReactDomTestUtils.Simulate.click(node.querySelector(".btn-danger"));
    });
    expect(node.querySelector(".modal")).to.be.ok;
    ReactDomTestUtils.act(() => {
      ReactDomTestUtils.Simulate.click(
        node.querySelector(".modal .btn-primary")
      );
    });
    expect(declineChanges.firstCall).to.be.ok;
  });

  it("should display rollback button when status is wip and call rollbackChanges from modal", async () => {
    const { rollbackChanges, node } = renderButtons({
      status: "work-in-progress",
      canReview: true,
    });
    ReactDomTestUtils.act(() => {
      ReactDomTestUtils.Simulate.click(node.querySelector(".btn-danger"));
    });
    expect(node.querySelector(".modal")).to.be.ok;
    ReactDomTestUtils.act(() => {
      ReactDomTestUtils.Simulate.click(
        node.querySelector(".modal .btn-primary")
      );
    });
    expect(rollbackChanges.firstCall).to.be.ok;
  });
});
