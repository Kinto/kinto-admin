import { updatePath } from "redux-simple-router";

import * as ClientActions from "./client";


export const SESSION_SETUP_COMPLETE = "SESSION_SETUP_COMPLETE";
export const SESSION_LOGOUT = "SESSION_LOGOUT";

export function setup(session) {
  return (dispatch) => {
    // First reflect server info to state
    dispatch({type: SESSION_SETUP_COMPLETE, session});
    // Then trigger buckets list retrieval
    dispatch(ClientActions.listBuckets());
  };
}

export function logout() {
  return (dispatch) => {
    dispatch({type: SESSION_LOGOUT});
    dispatch(updatePath("/"));
  };
}
