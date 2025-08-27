import { notifySuccess } from "@src/hooks/notifications";
import { copyToClipboard, humanDate, timeago } from "@src/utils";
import React from "react";
import { Copy } from "react-bootstrap-icons";

async function onCopyClick(value: string) {
  await copyToClipboard(value);
  notifySuccess("Timestamp copied to clipboard");
}

interface TimestampProps {
  timestamp?: number | null;
}

export default function Timestamp({ timestamp }: TimestampProps) {
  if (!timestamp) {
    return <>{"N/A"}</>;
  }
  return (
    <span className="timestamp" title={humanDate(timestamp)}>
      {timeago(timestamp)}{" "}
      <span
        className="icon"
        title={timestamp.toString()}
        onClick={() => onCopyClick(timestamp.toString())}
      >
        <Copy className="icon" />
      </span>
    </span>
  );
}
