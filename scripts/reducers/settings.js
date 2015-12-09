import { SETTINGS_SAVED } from "../actions/settings";

export const defaultSettings = {
  server: "http://localhost:8888/v1",
  username: "user",
  password: "",
  bucket: "default",
};
const jsonSettings = localStorage.getItem("kwac_settings");
const INITIAL_STATE = jsonSettings ? JSON.parse(jsonSettings) : defaultSettings;

export default function settings(state = INITIAL_STATE, action) {
  switch (action.type) {
  case SETTINGS_SAVED:
    return {...state, ...action.settings};
  default:
    return state;
  }
}
