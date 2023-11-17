import CommentDialog from "../../CommentDialog";
import React, { useState } from "react";
import { SignoffCollectionStatus } from "../../../types";

import { useLocation } from "react-router";
import { parseSearchString } from "../../../locationUtils";
import { ChatLeft, Check2, XCircleFill } from "react-bootstrap-icons";
import Spinner from "../../Spinner";

export interface SimpleReviewButtonsProps {
  status: SignoffCollectionStatus;
  canRequestReview: boolean;
  canReview: boolean;
  approveChanges(): void;
  declineChanges(text: string): void;
  requestReview(text: string): void;
  rollbackChanges(text: string): void;
}

export default function SimpleReviewButtons({
  status,
  canRequestReview,
  canReview,
  approveChanges,
  declineChanges,
  requestReview,
  rollbackChanges,
}: SimpleReviewButtonsProps) {
  const [dialog, setDialog] = useState<"reject" | "rollback" | "review" | "">(
    ""
  );
  const searchParams = parseSearchString(useLocation().search);
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <>
      <div className="simple-review-buttons">
        {status === "to-review" && canReview && (
          <>
            <button
              className="btn btn-success"
              onClick={() => {
                setShowSpinner(true);
                approveChanges();
              }}
            >
              <Check2 className="icon" /> Approve...
            </button>{" "}
            <button
              className="btn btn-danger"
              onClick={() => setDialog("reject")}
            >
              <ChatLeft className="icon" /> Decline...
            </button>
          </>
        )}
        {status === "work-in-progress" && canRequestReview && (
          <button
            className="btn btn-info request-review"
            onClick={() => {
              setDialog("review");
            }}
          >
            <ChatLeft className="icon" /> Request review...
          </button>
        )}{" "}
        {canRequestReview &&
          ["work-in-progress", "to-review"].includes(status) &&
          !searchParams.hideRollback && (
            <button
              className="btn btn-danger"
              onClick={() => setDialog("rollback")}
            >
              <XCircleFill className="icon" /> Rollback changes...
            </button>
          )}
      </div>
      {dialog === "reject" && (
        <CommentDialog
          description="Leave a comment for the editor. Note that these changes will not be undone (you can use the 'Rollback' button for that):"
          confirmLabel="Reject changes"
          onConfirm={val => {
            setShowSpinner(true);
            declineChanges(val);
          }}
          onClose={() => setDialog("")}
        />
      )}
      {dialog === "rollback" && (
        <CommentDialog
          description="Rolling back will discard all changes. Leave a comment:"
          confirmLabel="Rollback"
          onConfirm={val => {
            setShowSpinner(true);
            rollbackChanges(val);
          }}
          onClose={() => setDialog("")}
        />
      )}
      {dialog === "review" && (
        <CommentDialog
          description="Leave some notes for the reviewer:"
          confirmLabel="Request review"
          onConfirm={val => {
            setShowSpinner(true);
            requestReview(val);
          }}
          onClose={() => setDialog("")}
        />
      )}
      {showSpinner && <Spinner />}
    </>
  );
}
