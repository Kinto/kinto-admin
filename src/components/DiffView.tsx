import { unifiedMergeView } from "@codemirror/merge";
import CodeMirror, { EditorState, EditorView } from "@uiw/react-codemirror";
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

// Match the old diff look: solid green/red rows, colored text, +/- markers.
const diffTheme = EditorView.theme({
  ".cm-line::before": { content: '"  "' },
  ".cm-line.cm-changedLine": { background: "#cbeecb", color: "green" },
  ".cm-line.cm-changedLine::before": { content: '"+ "' },
  ".cm-deletedChunk": { background: "#f0c9c9", color: "red" },
  ".cm-deletedLine::before": { content: '"- "' },
  // Every document has at least one line, so an added or removed record ends
  // with an empty one. Hide it.
  ".cm-line:last-child:has(> br:only-child)": { display: "none" },
  ".cm-collapsedLines": { background: "none", padding: "0 6px" },
  ".cm-collapsedLines:before, .cm-collapsedLines:after": { content: "none" },
});

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
        highlightChanges: false,
        syntaxHighlightDeletions: false,
        gutter: false,
        // The default scanLimit gives up on precise diffs for anything over
        // ~8KB, which turns whole-collection diffs into one big block.
        diffConfig: { timeout: 1000 },
        collapseUnchanged: allLines ? undefined : {},
      }),
      diffTheme,
      EditorView.lineWrapping,
      EditorState.phrases.of({ "$ unchanged lines": "..." }),
    ],
    [oldText, allLines]
  );

  return (
    <CodeMirror
      key={oldText}
      value={newText}
      editable={false}
      readOnly
      basicSetup={false}
      extensions={extensions}
    />
  );
}
