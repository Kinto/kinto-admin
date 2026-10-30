import { json } from "@codemirror/lang-json";
import type { WidgetProps } from "@rjsf/utils";
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
      extensions={[json()]}
      indentWithTab={false}
    />
  );
}
