import React from "react";
import type { CollectionState } from "../../types";

export default function SimpleReviewHeader({
  status,
  last_editor_comment,
  last_review_request_by,
  last_reviewer_comment,
  children,
}: CollectionState["data"] & { children?: React.ReactElement }) {
  return (
    <div className="simple-review-header">
      <div className="card mb-4">
        {status === "to-review" && (
          <div className="card-header">
            Review requested by <strong>{last_review_request_by}</strong>:
          </div>
        )}
        {status === "work-in-progress" && (
          <div className="card-header">
            Status is <code>{status}</code>. Most recent reviewer comment was:
          </div>
        )}
        <div className="card-body">
          <p className="card-text">
            {status === "to-review" &&
              (last_editor_comment ||
                "(No review comment was left by the author)")}
            {status === "work-in-progress" && last_reviewer_comment}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
