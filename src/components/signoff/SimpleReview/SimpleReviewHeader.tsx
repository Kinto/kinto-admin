import React from "react";
import { SignoffSourceInfo } from "../../../types";

export default function SimpleReviewHeader({
  status,
  lastEditorComment,
  lastReviewRequestBy,
  lastReviewerComment,
  children,
}: SignoffSourceInfo & { children?: React.ReactElement }) {
  return (
    <div className="simple-review-header">
      <div className="card mb-4">
        {status === "to-review" && (
          <div className="card-header">
            Review requested by <strong>{lastReviewRequestBy}</strong>:
          </div>
        )}

        {status === "work-in-progress" && (
          <div className="card-header">
            Status is <code>{status}</code>.{" "}
            {lastReviewerComment && "Most recent reviewer comment was:"}
          </div>
        )}
        <div className="card-body">
          {status === "to-review" && (
            <p className="card-text">
              {lastEditorComment || "(No comment was left by the author)"}
            </p>
          )}
          {status === "work-in-progress" && (
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
