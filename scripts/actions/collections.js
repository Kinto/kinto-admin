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
        if (Object.keys(json).length === 0) {
          throw new Error("Empty collections configuration.");
        } else {
          dispatch(collectionsListReceived(json));
        }
      })
      .catch(err => {
        dispatch(NotificationsActions.notifyError(err));
      });
  };
}
