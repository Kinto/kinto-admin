import React from "react";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";

type Props = {
  readonly: boolean;
  disabled: boolean;
  value: any;
  onChange: (code: string) => void;
};

export default function JSONEditor({
  readonly,
  disabled,
  value,
  onChange,
}: Props) {
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
      style={{}}
      extensions={[langs.json()]}
      indentWithTab={true}
    />
  );
}
