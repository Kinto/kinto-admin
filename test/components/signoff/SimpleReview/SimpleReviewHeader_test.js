import { createComponent } from "../../../test_utils";
import SimpleReviewHeader from "../../../../src/components/signoff/SimpleReview/SimpleReviewHeader";
import * as React from "react";

const toReviewProps = {
  bid: "a",
  cid: "b",
  status: "to-review",
  lastReviewRequestBy: "ana",
  lastEditorComment: "please review",
};

const wipProps = {
  bid: "a",
  cid: "b",
  status: "work-in-progress",
  lastReviewerComment: "no thanks",
};

describe("SimpleReviewHeader component", () => {
  it("should render title when component is to-review", () => {
    const node = createComponent(<SimpleReviewHeader {...toReviewProps} />);
    expect(node.querySelector(".card-header").textContent).toBe(
      "Review requested by ana:"
    );
  });
  it("should render an editor comment when component is to-review", () => {
    const node = createComponent(<SimpleReviewHeader {...toReviewProps} />);
    expect(node.querySelector(".card-text").textContent).toBe("please review");
  });
  it("should render a reviewer comments as expected when component is wip", () => {
    const node = createComponent(
      <SimpleReviewHeader
        {...wipProps}
        lastEditDate={123}
        lastReviewDate={124}
      />
    );
    expect(node.querySelector(".card-text").textContent).toBe("no thanks");
    expect(node.querySelector(".card-header").textContent).toBe(
      "Status is work-in-progress. Most recent reviewer comment was:"
    );
  });
});
