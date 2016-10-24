import { call, put, take } from "redux-saga/effects";
import { push as updatePath } from "react-router-redux";

import { getClient } from "../client";
import { storeRedirectURL } from "../actions/session";
import { routeLoadRequest, routeLoadSuccess, routeLoadFailure } from "../actions/route";
import { notifyInfo, notifyError, clearNotifications } from "../actions/notifications";
import { SESSION_AUTHENTICATED } from "../constants";
import url from "../url";


function getBatchLoadFn(bid, cid, gid, rid) {
  return (batch) => {
    if (bid) {
      const bucket = batch.bucket(bid);
      bucket.getData();
      bucket.listGroups();
      if (gid) {
        bucket.getGroup(gid);
      }
      if (cid) {
        const coll = bucket.collection(cid);
        coll.getData();
        if (rid) {
          coll.getRecord(rid);
        }
      }
    }
  };
}

function identifyResponse(index, bid, cid, gid, rid) {
  switch(index) {
    case 0: return {type: "Bucket", id: bid};
    case 1: return {type: "Groups", id: bid};
    case 2: return {
      type: cid ? "Collection" : "Group",
      id: cid ? cid : gid,
    };
    case 3: return {type: "Record", id: rid};
  }
}

export function* loadRoute(params) {
  const {bid, cid, gid, rid} = params;

  // If we don't have anything to load, exit
  if (!bid && !cid && !gid && !rid) {
    return;
  }

  try {
    const client = getClient();

    yield put(routeLoadRequest(params));

    // Fetch all currently selected resource data in a single batch request
    const res = yield call([client, client.batch], getBatchLoadFn(bid, cid, gid, rid));
    const responses = res.map(({status, body}, index) => {
      const {id, type} = identifyResponse(index, bid, cid, gid, rid);
      if (status === 404) {
        throw new Error(`${type} ${id} does not exist.`);
      } else if (status === 403) {
        return {data: {id}, permissions: {read: [], write: []}};
      }
      return body;
    });
    // Map them to state
    const bucket     = bid ?               responses[0] : null;
    const groupsResp = bid ?               responses[1] : null;
    const collection = bid && cid ?        responses[2] : null;
    const group      = bid && gid ?        responses[2] : null;
    const record     = bid && cid && rid ? responses[3] : null;
    const {data: groups} = groupsResp;
    yield put(routeLoadSuccess({bucket, groups, collection, group, record}));
  } catch(error) {
    yield put(routeLoadFailure());
    yield put(notifyError("Couldn't retrieve route resources.", error));
  }
}

export function* routeUpdated(getState, action) {
  const {session: {authenticated}} = getState();
  const {params, location} = action;
  const {token} = params;

  // Clear notifications on each route update
  yield put(clearNotifications());

  // Check for an authenticated session; if we're requesting anything other
  // than the homepage, redirect to the homepage with a notification.
  if (!authenticated && !token && location.pathname !== "/") {
    yield put(storeRedirectURL(location.pathname));
    yield put(updatePath(""));
    yield put(notifyInfo("Authentication required.", {persistent: true}));
    // pause until the user is authenticated
    yield take(SESSION_AUTHENTICATED);
    // clear auth related notifications
    yield put(clearNotifications({force: true}));
    // Redirect the user to the initially requested URL
    yield put(updatePath(location.pathname));
    // Clear stored redirectURL
    yield put(storeRedirectURL(null));
  } else {
    // Load route related resources
    yield call(loadRoute, params);

    // Side effect: scroll to page top on each route change
    yield call([window, window.scrollTo], 0, 0);
  }
}

export function* routeRedirect(getState, action) {
  const {name, params} = action;
  yield put(updatePath(url(name, params)));
}
