import { WidgetProps } from "@rjsf/utils";
import React from "react";
import { Dash } from "react-bootstrap-icons";

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
    dataURL: "data:text/plain;base64,", // makes rjsf happy
  });
}
