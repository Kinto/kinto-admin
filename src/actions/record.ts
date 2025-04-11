import { RECORD_BUSY, RECORD_RESET } from "@src/constants";

export function recordBusy(busy: boolean): {
  type: "RECORD_BUSY";
  busy: boolean;
} {
  return { type: RECORD_BUSY, busy };
}

export function resetRecord(): {
  type: "RECORD_RESET";
} {
  return { type: RECORD_RESET };
}
