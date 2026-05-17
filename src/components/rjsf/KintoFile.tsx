import { WidgetProps } from "@rjsf/utils";
import React from "react";
import { Dash } from "react-bootstrap-icons";

/**
 * Overriding rjsf's current default behavior for files.
 * Currently, rjsf (v6.4.1) base64 encodes all files once selected.
 * This can cause a significant performance issue on files over 5MB, which our
 * users regularly work with.
 * The key is to override the onChange behavior to block the current rjsf
 * behavior while keeping rjsf validator's happy.
 * I plan to open a follow-up PR in rjsf to refactor the FileWidget component
 * to resolve this issue upstream. Then we can drop this.
 */

export default function KintoFile({
  disabled,
  onChange: rjsfOnChange,
  id,
  readonly,
  required,
  title,
  value,
}: WidgetProps) {
  return (
    <div>
      <label htmlFor={id}>{title}</label>
      <input
        type="file"
        data-testid="file"
        name="__attachment__"
        id={id}
        aria-label={title}
        required={required && !value}
        disabled={disabled}
        readOnly={readonly}
        onChange={async evt => {
          // overriding rjsf onChange behavior is the important part
          await onChange(evt, rjsfOnChange);
        }}
      />
      {value && !readonly && !disabled && (
        <button
          type="button"
          className="btn btn-danger btn-sm"
          title="Clear selected file"
          onClick={() => rjsfOnChange(null)}
        >
          <Dash className="icon" />
        </button>
      )}
    </div>
  );
}

async function onChange(evt, changeCallback) {
  const files = evt.target.files;
  if (!files?.length) {
    changeCallback(null);
    return;
  }
  changeCallback({
    ...files[0],
    dataURL: "data:text/plain;base64,", // Use a hardcoded dataURL to prevent rjsf from throwing a validation error
  });
}
