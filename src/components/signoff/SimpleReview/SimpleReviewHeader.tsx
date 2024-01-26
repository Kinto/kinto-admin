import { SignoffSourceInfo } from "@src/types";
import React from "react";

export default function SimpleReviewHeader({
  status,
  lastEditorComment,
  lastReviewRequestBy,
  lastReviewerComment,
  children,
  lastEditDate,
  lastReviewDate,
}: SignoffSourceInfo & { children?: React.ReactElement }) {
  return (
    <div className="simple-review-header" data-testid="simple-review-header">
      <div className="card mb-4">
        {status === "to-review" && (
          <div className="card-header">
            Review requested by <strong>{lastReviewRequestBy}</strong>:
          </div>
        )}

        {status === "work-in-progress" && (
          <div className="card-header">
            Status is <code>{status}</code>.{" "}
            {lastReviewerComment &&
              lastEditDate < lastReviewDate &&
              "Most recent reviewer comment was:"}
          </div>
        )}
        <div className="card-body">
          {status === "to-review" && (
            <p className="card-text">
              {lastEditorComment || "(No comment was left by the author)"}
            </p>
          )}
          {status === "work-in-progress" && lastEditDate < lastReviewDate && (
            <p className="card-text">
              {lastReviewerComment || "(No comment was left by a reviewer)"}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
