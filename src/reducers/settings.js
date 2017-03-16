/* @flow */
import type { SettingsState } from "../types";

const INITIAL_STATE: SettingsState = {
  maxPerPage: 200,
  singleServer: null,
  authMethods: ["basicauth", "fxa", "ldap", "portier", "anonymous"],
  sidebarMaxListedCollections: 10,
};

// This is basically a noop as we don't support settings update at runtime (yet).
export default function settings(
  state: SettingsState = INITIAL_STATE
): SettingsState {
  return { ...INITIAL_STATE, ...state };
}
