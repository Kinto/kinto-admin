import { WidgetProps } from "@rjsf/utils";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import React from "react";

export default function JSONEditor({
  readonly,
  disabled,
  value,
  onChange,
}: WidgetProps) {
  const onCodeChange = (code: string, viewUpdate: ViewUpdate) => {
    onChange(code);
  };

  return readonly || disabled ? (
    <pre>{value}</pre>
  ) : (
    <CodeMirror
      value={value}
      onChange={onCodeChange}
      height="auto"
      extensions={[langs.tsx()]}
      indentWithTab={false}
    />
  );
}
