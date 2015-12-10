import * as NotificationsActions from "./notifications";

export const COLLECTION_SYNCED = "COLLECTION_SYNCED";
export const COLLECTIONS_LIST_RECEIVED = "COLLECTIONS_LIST_RECEIVED";

export function markSynced(name, synced) {
  return {type: COLLECTION_SYNCED, name, synced};
}

export function collectionsListReceived(collections) {
  return {
    type: COLLECTIONS_LIST_RECEIVED,
    collections
  };
}

export function loadCollections() {
  return (dispatch) => {
    fetch("./config.json")
      .then(res => res.json())
      .then(json => {
        dispatch(collectionsListReceived(json));
      })
      .catch(err => {
        NotificationsActions.notifyError(err);
      });
  };
}
