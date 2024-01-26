import { humanDate, timeago } from "@src/utils";
import React from "react";

export default function HumanDate({
  timestamp,
}: {
  timestamp?: number | null;
}) {
  if (!timestamp) {
    return <>{"N/A"}</>;
  }
  return <span title={humanDate(timestamp)}>{timeago(timestamp)}</span>;
}
