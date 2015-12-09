export const COLLECTION_SYNCED = "COLLECTION_SYNCED";

export function markSynced(name, synced) {
  return {type: COLLECTION_SYNCED, name, synced};
}
