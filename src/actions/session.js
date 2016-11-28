/* @flow */

import type { ActionType, AuthData, ServerInfo } from "../types";

import { notifyError } from "./notifications";
import {
  SESSION_BUSY,
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_STORE_REDIRECT_URL,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_PERMISSIONS_SUCCESS,
  SESSION_BUCKETS_REQUEST,
  SESSION_BUCKETS_SUCCESS,
  SESSION_AUTHENTICATED,
  SESSION_LOGOUT,
} from "../constants";


export function sessionBusy(busy: boolean): {
  type: "SESSION_BUSY",
  busy: boolean,
} {
  return {type: SESSION_BUSY, busy};
}

export function setup(auth: Object): {
  type: "SESSION_SETUP",
  auth: Object,
} {
  return {type: SESSION_SETUP, auth};
}

export function setupComplete(auth: AuthData): {
  type: "SESSION_SETUP_COMPLETE",
  auth: AuthData,
} {
  return {type: SESSION_SETUP_COMPLETE, auth};
}

export function storeRedirectURL(redirectURL: ?string): {
  type: "SESSION_STORE_REDIRECT_URL",
  redirectURL: ?string,
} {
  return {type: SESSION_STORE_REDIRECT_URL, redirectURL};
}

export function serverInfoSuccess(serverInfo: ServerInfo): {
  type: "SESSION_SERVERINFO_SUCCESS",
  serverInfo: ServerInfo,
} {
  return {type: SESSION_SERVERINFO_SUCCESS, serverInfo};
}

export function permissionsListSuccess(permissions: Object[]): {
  type: "SESSION_PERMISSIONS_SUCCESS",
  permissions: Object[],
} {
  return {type: SESSION_PERMISSIONS_SUCCESS, permissions};
}

export function listBuckets(): {
  type: "SESSION_BUCKETS_REQUEST",
} {
  return {type: SESSION_BUCKETS_REQUEST};
}

export function bucketsSuccess(buckets: Object[]): {
  type: "SESSION_BUCKETS_SUCCESS",
  buckets: Object[],
} {
  return {type: SESSION_BUCKETS_SUCCESS, buckets};
}

export function setAuthenticated(): {
  type: "SESSION_AUTHENTICATED",
} {
  return {type: SESSION_AUTHENTICATED};
}

export function logout(): {
  type: "SESSION_LOGOUT",
} {
  return {type: SESSION_LOGOUT};
}

/**
 * Massive side effect: this will navigate away from the current page to perform
 * authentication to a third-party service, like FxA.
 */
export function navigateToExternalAuth(authFormData: Object): ?ActionType<typeof notifyError> {
  const {origin, pathname} = document.location;
  const {server} = authFormData;
  try {
    const payload = btoa(JSON.stringify(authFormData));
    const redirect = encodeURIComponent(`${origin}${pathname}#/auth/${payload}/`);
    document.location.href = `${server}/fxa-oauth/login?redirect=${redirect}`;
  } catch(error) {
    return notifyError("Couldn't redirect to authentication endpoint.", error);
  }
}
