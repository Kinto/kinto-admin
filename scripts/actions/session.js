import { updatePath } from "redux-simple-router";

import * as ClientActions from "./client";


export const SESSION_SETUP_COMPLETE = "SESSION_SETUP_COMPLETE";
export const SESSION_SERVER_INFO_LOADED = "SESSION_SERVER_INFO_LOADED";
export const SESSION_BUCKETS_LIST_LOADED = "SESSION_BUCKETS_LIST_LOADED";
export const SESSION_LOGOUT = "SESSION_LOGOUT";

export function setup(session) {
  return (dispatch) => {
    // First reflect server info to state
    dispatch({type: SESSION_SETUP_COMPLETE, session});
    // Then trigger buckets list retrieval
    dispatch(ClientActions.listBuckets());
  };
}

export function serverInfoLoaded(serverInfo) {
  return {
    type: SESSION_SERVER_INFO_LOADED,
    serverInfo,
  };
}

export function bucketListLoaded(buckets) {
  return {
    type: SESSION_BUCKETS_LIST_LOADED,
    buckets,
  };
}

export function logout() {
  return (dispatch) => {
    ClientActions.resetClient();
    dispatch({type: SESSION_LOGOUT});
    dispatch(updatePath("/"));
  };
}
