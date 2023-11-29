import { render } from "@testing-library/react";
import SimpleReviewHeader from "../../../../src/components/signoff/SimpleReview/SimpleReviewHeader";
import React from "react";

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
    const node = render(<SimpleReviewHeader {...toReviewProps} />);
    expect(node.getByText(/Review requested by/).textContent).toBe(
      "Review requested by ana:"
    );
  });
  it("should render an editor comment when component is to-review", () => {
    const node = render(<SimpleReviewHeader {...toReviewProps} />);
    expect(node.getByText("please review")).toBeDefined();
  });
  it("should render a reviewer comment when component is wip", () => {
    const node = render(
      <SimpleReviewHeader
        {...wipProps}
        lastEditDate={123}
        lastReviewDate={124}
      />
    );
    expect(node.getByText("no thanks")).toBeDefined();
    expect(node.getByText(/Status is/).textContent).toBe(
      "Status is work-in-progress. Most recent reviewer comment was:"
    );
  });
});
