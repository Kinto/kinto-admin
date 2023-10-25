import React from "react";

import { timeago, humanDate } from "../../utils";

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
