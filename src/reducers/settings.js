/* @flow */
import type { SettingsState } from "../types";


const INITIAL_STATE: SettingsState = {
  maxPerPage: 200,
};

// This is basically a noop as we don't support settings update at runtime (yet).
export default function settings(state: SettingsState = INITIAL_STATE): SettingsState {
  return state;
}
