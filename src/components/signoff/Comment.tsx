import React, { useState } from "react";
import Spinner from "../Spinner";

export function Comment({ text }: { text: string }) {
  return (
    <span title={text} className="signoff-comment">
      {text.split("\n").map((l, i) => (
        <span key={i}>
          {l}
          <br />
        </span>
      ))}
    </span>
  );
}

type CommentDialogProps = {
  title?: string;
  description: string;
  confirmLabel: string;
  onConfirm: (comment: string) => void;
  onClose: () => void;
};

export function CommentDialog({
  title = "Confirmation",
  description,
  onConfirm,
  confirmLabel,
  onClose,
}: CommentDialogProps) {
  const [comment, setComment] = useState<string>("");
  const [showSpinner, setShowSpinner] = useState(false);

  const onCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const onClickConfirm = () => {
    setShowSpinner(true);
    onConfirm(comment);
    onClose();
  };

  return (
    <div
      className="modal"
      tabIndex={-1}
      role="dialog"
      style={{ display: "block" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>{description}</p>
            <textarea
              className="form-control"
              placeholder="Comment..."
              onChange={onCommentChange}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClickConfirm}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
        {showSpinner && <Spinner />}
      </div>
    </div>
  );
}
