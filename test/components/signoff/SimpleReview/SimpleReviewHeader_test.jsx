import SimpleReviewHeader from "../../../../src/components/signoff/SimpleReview/SimpleReviewHeader";
import { render, screen } from "@testing-library/react";
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
    render(<SimpleReviewHeader {...toReviewProps} />);
    expect(screen.getByText(/Review requested by/).textContent).toBe(
      "Review requested by ana:"
    );
  });
  it("should render an editor comment when component is to-review", () => {
    render(<SimpleReviewHeader {...toReviewProps} />);
    expect(screen.getByText("please review")).toBeDefined();
  });
  it("should render a reviewer comment when component is wip", () => {
    render(
      <SimpleReviewHeader
        {...wipProps}
        lastEditDate={123}
        lastReviewDate={124}
      />
    );
    expect(screen.getByText("no thanks")).toBeDefined();
    expect(screen.getByText(/Status is/).textContent).toBe(
      "Status is work-in-progress. Most recent reviewer comment was:"
    );
  });
});
