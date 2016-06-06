import { notifyError } from "./notifications";
import {
  SESSION_BUSY,
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_STORE_REDIRECT_URL,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_BUCKETS_REQUEST,
  SESSION_BUCKETS_SUCCESS,
  SESSION_LOGOUT,
} from "../constants";


export function sessionBusy(busy) {
  return {type: SESSION_BUSY, busy};
}

export function setup(session) {
  return {type: SESSION_SETUP, session};
}

export function setupComplete(session) {
  return {type: SESSION_SETUP_COMPLETE, session};
}

export function storeRedirectURL(redirectURL) {
  return {type: SESSION_STORE_REDIRECT_URL, redirectURL};
}

export function serverInfoSuccess(serverInfo) {
  return {type: SESSION_SERVERINFO_SUCCESS, serverInfo};
}

export function listBuckets() {
  return {type: SESSION_BUCKETS_REQUEST};
}

export function bucketsSuccess(buckets) {
  return {type: SESSION_BUCKETS_SUCCESS, buckets};
}

export function logout() {
  return {type: SESSION_LOGOUT};
}

/**
 * Massive side effect: this will navigate away from the current page to perform
 * authentication to a third-party service, like FxA.
 */
export function navigateToExternalAuth(authFormData) {
  const {origin, pathname} = document.location;
  const {server} = authFormData;
  try {
    const payload = btoa(JSON.stringify(authFormData));
    const redirect = encodeURIComponent(`${origin}${pathname}#/auth/${payload}/`);
    document.location = `${server}/fxa-oauth/login?redirect=${redirect}`;
  } catch(error) {
    return notifyError(error);
  }
}
