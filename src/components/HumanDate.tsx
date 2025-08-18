import { notifySuccess } from "@src/hooks/notifications";
import { copyToClipboard, humanDate, timeago } from "@src/utils";
import React from "react";
import { Copy } from "react-bootstrap-icons";

async function onCopyClick(value: string) {
  await copyToClipboard(value);
  notifySuccess("Timestamp copied to clipboard");
}

interface TimestampProps {
  value?: number | null;
}

export default function Timestamp({ value }: TimestampProps) {
  if (!value) {
    return <>{"N/A"}</>;
  }
  return (
    <span className="timestamp" title={humanDate(value)}>
      {timeago(value)}{" "}
      <span
        className="icon"
        title={value.toString()}
        onClick={() => onCopyClick(value.toString())}
      >
        <Copy className="icon" />
      </span>
    </span>
  );
}
