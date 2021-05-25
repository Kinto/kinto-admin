import { expect } from "chai";
import { createComponent } from "../../test_utils";

import SimpleReviewHeader from "../../../src/components/simpleReview/SimpleReviewHeader";

const toReviewProps = {
  status: "to-review",
  last_review_request_by: "ana",
  last_editor_comment: "please review",
};

const wipProps = {
  status: "work-in-progress",
  last_reviewer_comment: "no thanks",
};

describe("SimpleReviewHeader component", () => {
  it("should render title when component is to-review", () => {
    const node = createComponent(SimpleReviewHeader, toReviewProps);
    expect(node.querySelector(".card-header").textContent).to.equal(
      "Review requested by ana:"
    );
  });
  it("should render an editor comment when component is to-review", () => {
    const node = createComponent(SimpleReviewHeader, toReviewProps);
    expect(node.querySelector(".card-text").textContent).to.equal(
      "please review"
    );
  });
  it("should render a wip header", () => {
    const node = createComponent(SimpleReviewHeader, wipProps);
    expect(node.querySelector(".card-header").textContent).to.equal(
      "Status is work-in-progress. Most recent reviewer comment was:"
    );
  });
  it("should render a reviewer comment when component is wip", () => {
    const node = createComponent(SimpleReviewHeader, wipProps);
    expect(node.querySelector(".card-text").textContent).to.equal("no thanks");
  });
});
