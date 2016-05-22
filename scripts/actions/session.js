import {
  SESSION_BUSY,
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_SERVERINFO_REQUEST,
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

export function fetchServerInfo() {
  return {type: SESSION_SERVERINFO_REQUEST};
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
