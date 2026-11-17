import { MergeView, unifiedMergeView } from "@codemirror/merge";
import { EditorState, EditorView } from "@uiw/react-codemirror";
import { canonicalize } from "diff";
import { useEffect, useRef } from "react";

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
  // Indent unchanged lines so they line up with the +/- markers.
  ".cm-line::before": { content: '"  "' },
  // Every document has at least one line, so an added or removed record ends
  // with an empty one. Hide it.
  ".cm-line:last-child:has(> br:only-child)": { display: "none" },
  // added lines
  ".cm-line.cm-changedLine": {
    background: "#cbeecb",
    color: "green",
    "&::before": { content: '"+ "' },
  },
  "&.cm-merge-b .cm-changedText": { background: "#9ddb9d" },
  "&.cm-merge-a .cm-changedText": { background: "#e3a3a3" },
  // side by side: the old pane marks its changed lines as deleted
  "&.cm-merge-a .cm-line.cm-changedLine": {
    background: "#f0c9c9",
    color: "red",
    "&::before": { content: '"- "' },
  },
  // deleted lines
  ".cm-deletedChunk": {
    background: "#f0c9c9",
    color: "red",
    "& .cm-deletedLine::before": { content: '"- "' },
    "& .cm-deletedText": { background: "#e3a3a3" },
  },
  // Collapsed unchanged lines
  ".cm-collapsedLines": {
    background: "none",
    padding: "0 6px",
    "&:before, &:after": { content: "none" },
  },
});

// The default scanLimit gives up on precise diffs for anything over ~8KB,
// which turns whole-collection diffs into one big block.
const diffConfig = { timeout: 1000 };

export default function DiffView({
  source,
  target,
  allLines = false,
}: {
  source?: unknown;
  target?: unknown;
  allLines?: boolean;
}) {
  return (
    <TextDiffView
      oldText={stringifyForDiff(source)}
      newText={stringifyForDiff(target)}
      allLines={allLines}
    />
  );
}

export function TextDiffView({
  oldText,
  newText,
  sideBySide = false,
  allLines = false,
}: {
  oldText: string;
  newText: string;
  sideBySide?: boolean;
  allLines?: boolean;
}) {
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const extensions = [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      diffTheme,
      EditorView.lineWrapping,
      EditorState.phrases.of({ "$ unchanged lines": "..." }),
    ];
    const options = {
      highlightChanges: oldText !== "" && newText !== "",
      gutter: false,
      diffConfig,
      collapseUnchanged: allLines ? undefined : {},
    };
    const view = sideBySide
      ? new MergeView({
          a: { doc: oldText, extensions },
          b: { doc: newText, extensions },
          parent: parent.current,
          ...options,
        })
      : new EditorView({
          doc: newText,
          extensions: [
            unifiedMergeView({
              original: oldText,
              mergeControls: false,
              ...options,
            }),
            ...extensions,
          ],
          parent: parent.current,
        });
    return () => view.destroy();
  }, [oldText, newText, sideBySide, allLines]);

  return <div ref={parent} />;
}
