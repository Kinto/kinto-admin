import {
  ATTACHMENT_DELETE_REQUEST,
  COLLECTION_BUSY,
  COLLECTION_HISTORY_NEXT_REQUEST,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
  COLLECTION_RESET,
  RECORD_BULK_CREATE_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_UPDATE_REQUEST,
} from "@src/constants";
import type {
  HistoryFilters,
  RecordData,
  RecordUpdate,
  ResourceHistoryEntry,
  SagaNextFunction,
} from "@src/types";

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

export function listCollectionHistory(
  bid: string,
  cid: string,
  filters: HistoryFilters = {}
): {
  type: "COLLECTION_HISTORY_REQUEST";
  bid: string;
  cid: string;
  filters: HistoryFilters;
} {
  return { type: COLLECTION_HISTORY_REQUEST, bid, cid, filters };
}

export function listCollectionNextHistory(): {
  type: "COLLECTION_HISTORY_NEXT_REQUEST";
} {
  return { type: COLLECTION_HISTORY_NEXT_REQUEST };
}

export function listCollectionHistorySuccess(
  entries: ResourceHistoryEntry[],
  hasNextPage: boolean,
  next: SagaNextFunction | null | undefined
): {
  type: "COLLECTION_HISTORY_SUCCESS";
  entries: ResourceHistoryEntry[];
  hasNextPage: boolean;
  next: SagaNextFunction | null | undefined;
} {
  return { type: COLLECTION_HISTORY_SUCCESS, entries, hasNextPage, next };
}

export function createRecord(
  bid: string,
  cid: string,
  record: RecordData,
  attachment?: string
): {
  type: "RECORD_CREATE_REQUEST";
  bid: string;
  cid: string;
  record: RecordData;
  attachment?: string;
} {
  return { type: RECORD_CREATE_REQUEST, bid, cid, record, attachment };
}

export function updateRecord(
  bid: string,
  cid: string,
  rid: string,
  record: RecordUpdate,
  attachment?: string
): {
  type: "RECORD_UPDATE_REQUEST";
  bid: string;
  cid: string;
  rid: string;
  record: RecordUpdate;
  attachment?: string;
} {
  return { type: RECORD_UPDATE_REQUEST, bid, cid, rid, record, attachment };
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

export function bulkCreateRecords(
  bid: string,
  cid: string,
  records: RecordData[]
): {
  type: "RECORD_BULK_CREATE_REQUEST";
  bid: string;
  cid: string;
  records: RecordData[];
} {
  return { type: RECORD_BULK_CREATE_REQUEST, bid, cid, records };
}
