import type {
  RecordData,
  RecordUpdate,
  HistoryFilters,
  ResourceHistoryEntry,
} from "../types";

import {
  ATTACHMENT_DELETE_REQUEST,
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_HISTORY_REQUEST,
  COLLECTION_HISTORY_NEXT_REQUEST,
  COLLECTION_HISTORY_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_NEXT_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_TOTAL_RECORDS,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
} from "../constants";

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

export function listRecords(
  bid: string,
  cid: string,
  sort?: string
): {
  type: "COLLECTION_RECORDS_REQUEST";
  bid: string;
  cid: string;
  sort: string | null | undefined;
} {
  return { type: COLLECTION_RECORDS_REQUEST, bid, cid, sort };
}

export function listNextRecords(): {
  type: "COLLECTION_RECORDS_NEXT_REQUEST";
} {
  return { type: COLLECTION_RECORDS_NEXT_REQUEST };
}

export function listRecordsSuccess(
  records: RecordData[],
  hasNextRecords: boolean,
  listNextRecords: Function | null | undefined,
  isNextPage: boolean = false
): {
  type: "COLLECTION_RECORDS_SUCCESS";
  records: RecordData[];
  hasNextRecords: boolean;
  listNextRecords: Function | null | undefined;
  isNextPage: boolean;
} {
  return {
    type: COLLECTION_RECORDS_SUCCESS,
    records,
    hasNextRecords,
    listNextRecords,
    isNextPage,
  };
}

export function collectionTotalRecords(totalRecords: number): {
  type: "COLLECTION_TOTAL_RECORDS";
  totalRecords: number;
} {
  return {
    type: COLLECTION_TOTAL_RECORDS,
    totalRecords,
  };
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
  next: Function | null | undefined
): {
  type: "COLLECTION_HISTORY_SUCCESS";
  entries: ResourceHistoryEntry[];
  hasNextPage: boolean;
  next: Function | null | undefined;
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
