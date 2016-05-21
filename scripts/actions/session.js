import { updatePath } from "redux-simple-router";

import * as NotificationsActions from "./notifications";
import * as ClientActions from "./client";

import {
  SESSION_SETUP_COMPLETE,
  SESSION_SERVER_INFO_LOADED,
  SESSION_BUCKETS_LIST_LOADED,
  SESSION_LOGOUT,
} from "../constants";


export function setup(session) {
  return {type: "SESSION_SETUP", session};
  // return (dispatch) => {
  //   // Clear all pending notifications
  //   dispatch(NotificationsActions.clearNotifications({force: true}));
  //   // First reflect server info to state
  //   dispatch({type: SESSION_SETUP_COMPLETE, session});
  //   // Then trigger buckets list retrieval
  //   dispatch(ClientActions.listBuckets());
  // };
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
