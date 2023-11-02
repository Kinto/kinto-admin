import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/javascript/javascript";

const cmOptions = {
  theme: "default",
  height: "auto",
  viewportMargin: Infinity,
  mode: {
    name: "javascript",
    json: true,
    statementIndent: 2,
  },
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
};

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
  const onCodeChange = (editor: Object, metadata: any, code: string) => {
    onChange(code);
  };

  return readonly || disabled ? (
    <pre>{value}</pre>
  ) : (
    <CodeMirror
      value={value}
      autoCursor={false}
      onChange={onCodeChange}
      options={cmOptions}
    />
  );
}
