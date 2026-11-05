import { unifiedMergeView } from "@codemirror/merge";
import CodeMirror from "@uiw/react-codemirror";
import { canonicalize } from "diff";
import { useMemo } from "react";

// Sort keys so that key order doesn't show up as a change. A missing value
// (added or removed record) diffs against "". The trailing newline keeps that
// diff from showing an empty changed line.
function stringifyForDiff(value: unknown): string {
  if (value === undefined) {
    return "";
  }
  return (
    JSON.stringify(
      canonicalize(value, null, null, (_, v) => v),
      null,
      2
    ) + "\n"
  );
}

export default function DiffView({
  source,
  target,
  allLines = false,
}: {
  source?: unknown;
  target?: unknown;
  allLines?: boolean;
}) {
  const oldText = stringifyForDiff(source);
  const newText = stringifyForDiff(target);

  const extensions = useMemo(
    () => [
      unifiedMergeView({
        original: oldText,
        mergeControls: false,
        // Underlining every token of an added or removed record is noise.
        highlightChanges: oldText !== "" && newText !== "",
        // The default scanLimit gives up on precise diffs for anything over
        // ~8KB, which turns whole-collection diffs into one big block.
        diffConfig: { timeout: 1000 },
        collapseUnchanged: allLines ? undefined : {},
      }),
    ],
    [oldText, newText, allLines]
  );

  return (
    <CodeMirror
      key={oldText}
      value={newText}
      editable={false}
      readOnly
      maxHeight="40em"
      extensions={extensions}
    />
  );
}
