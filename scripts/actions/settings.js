import { saveSettings as saveSettingsLocally } from "../utils";
import * as NotificationsActions from "./notifications";
import * as CollectionActions from "./collection";

export const SETTINGS_LOADED = "SETTINGS_LOADED";
export const SETTINGS_SAVED = "SETTINGS_SAVED";

export const defaultSettings = {
  server: "https://kinto.dev.mozaws.net/v1",
  username: "user",
  password: "pass",
  bucket: "default",
};

export function settingsLoaded(settings) {
  return {
    type: SETTINGS_LOADED,
    settings: settings || defaultSettings
  };
}

export function saveSettings(settings) {
  return dispatch => {
    try {
      CollectionActions.configureKinto(settings);
      dispatch({type: SETTINGS_SAVED, settings});
      saveSettingsLocally(settings);
      dispatch(NotificationsActions.notifyInfo("Settings saved."));
    } catch (err) {
      dispatch(NotificationsActions.notifyError(err));
    }
  };
}
