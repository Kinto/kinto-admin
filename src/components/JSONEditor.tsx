import type { WidgetProps } from "@rjsf/utils";
import { langs } from "@uiw/codemirror-extensions-langs";
import type { ViewUpdate } from "@uiw/react-codemirror";
import CodeMirror from "@uiw/react-codemirror";

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
