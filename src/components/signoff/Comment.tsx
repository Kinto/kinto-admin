import React, { useState } from "react";

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
  description: string;
  confirmLabel: string;
  onConfirm: (s: string) => void;
  onCancel: () => void;
};

export function CommentDialog({
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: CommentDialogProps) {
  const [comment, setComment] = useState<string>("");

  const onCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const onClickConfirm = () => onConfirm(comment);

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
            <h5 className="modal-title">Confirmation</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onCancel}
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
              onClick={onCancel}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
