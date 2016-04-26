import {
  SETTINGS_LOADED,
  SETTINGS_SAVED,
  defaultSettings
} from "../actions/settings";

export default function settings(state = defaultSettings, action) {
  switch (action.type) {
  case SETTINGS_LOADED:
  case SETTINGS_SAVED:
    return {...state, ...action.settings};
  default:
    return state;
  }
}
