import { TextDiffView } from "@src/components/DiffView";
import Spinner from "@src/components/Spinner";
import type { Attachment, Capabilities, RecordData } from "@src/types";
import { buildAttachmentUrl } from "@src/utils";
import { filesize } from "filesize";
import type { ReactNode } from "react";
import { useState } from "react";

// Chosen by extension because attachment mimetypes are unreliable.
const TEXT_ATTACHMENT_EXTENSIONS = [
  ".txt",
  ".pem",
  ".ftl",
  ".json",
  ".geojson",
];
const MAX_ATTACHMENT_SIZE = 5_000_000;

function isTextAttachment({ filename }: Attachment): boolean {
  return TEXT_ATTACHMENT_EXTENSIONS.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );
}

type ComparisonState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; oldText: string; newText: string }
  | { status: "error"; error: Error };

export default function AttachmentDiff({
  source,
  target,
  capabilities,
  allLines,
}: {
  source: RecordData;
  target: RecordData;
  capabilities: Capabilities;
  allLines: boolean;
}) {
  const oldUrl = buildAttachmentUrl(source, capabilities);
  const newUrl = buildAttachmentUrl(target, capabilities);
  const [state, setState] = useState<ComparisonState>({ status: "idle" });
  const links = (
    <>
      Open the{" "}
      <a href={oldUrl} target="_blank" rel="noreferrer">
        old
      </a>{" "}
      or{" "}
      <a href={newUrl} target="_blank" rel="noreferrer">
        new
      </a>{" "}
      attachment.
    </>
  );

  if (
    !isTextAttachment(source.attachment) ||
    !isTextAttachment(target.attachment)
  ) {
    return (
      <div className="text-muted">
        Attachment contents can&apos;t be compared for this file type. {links}
      </div>
    );
  }
  const size = Math.max(source.attachment.size, target.attachment.size);
  if (size > MAX_ATTACHMENT_SIZE) {
    return (
      <div className="text-muted">
        Attachments are too large to compare ({filesize(size)}). {links}
      </div>
    );
  }
  const load = async () => {
    setState({ status: "loading" });
    try {
      setState({
        status: "loaded",
        ...(await fetchAttachmentTexts(oldUrl, newUrl)),
      });
    } catch (error) {
      setState({ status: "error", error });
    }
  };
  return (
    <details
      onToggle={e => {
        if (e.currentTarget.open && state.status === "idle") {
          load();
        }
      }}
    >
      <summary>Compare attachment contents</summary>
      <div className="mt-2">
        <ComparisonResult state={state} links={links} allLines={allLines} />
      </div>
    </details>
  );
}

function ComparisonResult({
  state,
  links,
  allLines,
}: {
  state: ComparisonState;
  links: ReactNode;
  allLines: boolean;
}) {
  switch (state.status) {
    case "idle":
      return null;
    case "loading":
      return <Spinner />;
    case "error":
      return (
        <div className="text-danger">
          Could not fetch attachment contents ({state.error.message}). {links}
        </div>
      );
    case "loaded":
      if (state.oldText === state.newText) {
        return (
          <div className="text-muted">
            No differences in attachment contents.
          </div>
        );
      }
      return (
        <div className="attachment-diff" data-testid="attachment-diff">
          <TextDiffView
            oldText={state.oldText}
            newText={state.newText}
            allLines={allLines}
          />
        </div>
      );
  }
}

export async function fetchAttachmentTexts(
  oldUrl: string,
  newUrl: string
): Promise<{ oldText: string; newText: string }> {
  const [oldText, newText] = await Promise.all([
    fetchText(oldUrl),
    fetchText(newUrl),
  ]);
  // Most JSON attachments are minified onto one line, which makes a line diff
  // useless. Anything that isn't JSON on both sides is diffed as-is.
  try {
    return {
      oldText: JSON.stringify(JSON.parse(oldText), null, 2),
      newText: JSON.stringify(JSON.parse(newText), null, 2),
    };
  } catch {
    return { oldText, newText };
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}
