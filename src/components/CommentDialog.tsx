import React, { useState } from "react";

type DialogProps = {
  title?: string;
  description: string;
  confirmLabel: string;
  onConfirm: (comment: string) => void;
  onClose: () => void;
};

export default function CommentDialog({
  title = "Confirmation",
  description,
  onConfirm,
  confirmLabel,
  onClose,
}: DialogProps) {
  const [value, setValue] = useState("");
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
              value={value}
              placeholder="Comment..."
              onChange={e => setValue(e.currentTarget.value)}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onConfirm(value);
                onClose();
              }}
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
      </div>
    </div>
  );
}
