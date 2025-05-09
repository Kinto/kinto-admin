import {
  ATTACHMENT_DELETE_REQUEST,
  COLLECTION_BUSY,
  COLLECTION_RESET,
  RECORD_DELETE_REQUEST,
} from "@src/constants";

export function collectionBusy(busy: boolean): {
  type: "COLLECTION_BUSY";
  busy: boolean;
} {
  return { type: COLLECTION_BUSY, busy };
}

export function resetCollection(): {
  type: "COLLECTION_RESET";
} {
  return { type: COLLECTION_RESET };
}

export function deleteRecord(
  bid: string,
  cid: string,
  rid: string,
  last_modified?: number
): {
  type: "RECORD_DELETE_REQUEST";
  bid: string;
  cid: string;
  rid: string;
  last_modified?: number;
} {
  return { type: RECORD_DELETE_REQUEST, bid, cid, rid, last_modified };
}

export function deleteAttachment(
  bid: string,
  cid: string,
  rid: string
): {
  type: "ATTACHMENT_DELETE_REQUEST";
  bid: string;
  cid: string;
  rid: string;
} {
  return { type: ATTACHMENT_DELETE_REQUEST, bid, cid, rid };
}
