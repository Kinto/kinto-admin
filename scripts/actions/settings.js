import * as NotificationsActions from "./notifications";
import * as CollectionActions from "./collection";

export const SETTINGS_SAVED = "SETTINGS_SAVED";


export function saveSettings(settings) {
  return dispatch => {
    try {
      CollectionActions.configureKinto(settings);
      dispatch({type: SETTINGS_SAVED, settings});
      localStorage.setItem("kwac_settings", JSON.stringify(settings));
      dispatch(NotificationsActions.notifyInfo("Settings saved."));
    } catch (err) {
      dispatch(NotificationsActions.notifyError(err));
    }
  };
}
