import { loadSettings } from "../utils";
import * as NotificationsActions from "./notifications";
import * as SettingsActions from "./settings";

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
        if (!json || Object.keys(json).length === 0) {
          throw new Error("Empty collections configuration.");
        } else {
          const {settings, collections} = json;
          const loadedSettings = loadSettings() || settings;
          dispatch(SettingsActions.settingsLoaded(loadedSettings));
          dispatch(collectionsListReceived(collections));
        }
      })
      .catch(err => {
        dispatch(NotificationsActions.notifyError(err));
      });
  };
}
