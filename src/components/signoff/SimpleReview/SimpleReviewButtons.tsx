import CommentDialog from "../../CommentDialog";
import React, { useState } from "react";
import { SignoffCollectionStatus } from "../../../types";

import { useLocation } from "react-router";
import { parseSearchString } from "../../../locationUtils";

export interface SimpleReviewButtonsProps {
  status: SignoffCollectionStatus;
  approveChanges(): void;
  declineChanges(text: string): void;
  rollbackChanges(text: string): void;
}

export default function SimpleReviewButtons({
  status,
  approveChanges,
  declineChanges,
  rollbackChanges,
}: SimpleReviewButtonsProps) {
  const [dialog, setDialog] = useState<"reject" | "rollback" | "">("");
  const searchParams = parseSearchString(useLocation().search);

  return (
    <>
      <div className="simple-review-buttons">
        {status === "to-review" && (
          <>
            <button
              className="btn btn-success"
              onClick={() => approveChanges()}
            >
              Approve
            </button>{" "}
            <button
              className="btn btn-danger"
              onClick={() => setDialog("reject")}
            >
              Reject
            </button>
          </>
        )}
        {status === "work-in-progress" && !searchParams.hideRollback && (
          <button
            className="btn btn-danger"
            onClick={() => setDialog("rollback")}
          >
            Rollback
          </button>
        )}
      </div>
      {dialog === "reject" && (
        <CommentDialog
          description="Leave a comment for the editor. Note that these changes will not be undone (you can use the 'Rollback' button for that):"
          confirmLabel="Reject changes"
          onConfirm={declineChanges}
          onClose={() => setDialog("")}
        />
      )}
      {dialog === "rollback" && (
        <CommentDialog
          description="Rolling back will discard all changes. Leave a comment:"
          confirmLabel="Rollback"
          onConfirm={rollbackChanges}
          onClose={() => setDialog("")}
        />
      )}
    </>
  );
}
