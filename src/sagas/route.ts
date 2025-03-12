import * as actions from "@src/actions/route";
import { storeRedirectURL } from "@src/actions/session";
import { getClient } from "@src/client";
import { SESSION_AUTHENTICATED } from "@src/constants";
import { notifyError, notifyInfo } from "@src/hooks/notifications";
import type { ActionType, GetStateFn, RouteParams, SagaGen } from "@src/types";
import url from "@src/url";
import { scrollToTop } from "@src/utils";
import {
  replace as replacePath,
  push as updatePath,
} from "redux-first-history";
import { call, put, take } from "redux-saga/effects";

function getBatchLoadFn(bid, cid, gid, rid) {
  return batch => {
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

function identifyResponse(
  index,
  bid,
  cid,
  gid,
  rid
): { type: string; data: any | any[] } {
  switch (index) {
    case 0:
      return { type: "Bucket", data: { id: bid } };
    case 1:
      return { type: "Groups", data: [] };
    case 2:
      return {
        type: cid ? "Collection" : "Group",
        data: { id: cid ? cid : gid },
      };
    case 3:
      return { type: "Record", data: { id: rid } };
    default:
      return { type: "Unknown", data: [] };
  }
}

export function* loadRoute(params: RouteParams): SagaGen {
  const { bid, cid, gid, rid } = params;

  // If we don't have anything to load, exit
  if (!bid && !cid && !gid && !rid) {
    return;
  }

  try {
    const client = getClient();

    yield put(actions.routeLoadRequest(params));

    // Fetch all currently selected resource data in a single batch request
    const res = yield call(
      [client, client.batch],
      getBatchLoadFn(bid, cid, gid, rid)
    );
    const responses = res.map(({ status, body }, index) => {
      const { type, ...data } = identifyResponse(index, bid, cid, gid, rid);
      if (type === "Unknown") {
        throw new Error("Unknown route resource.");
      } else if (status === 404) {
        const { data: resource } = data;
        if (!Array.isArray(resource)) {
          throw new Error(`${type} ${resource.id} does not exist.`);
        } else {
          throw new Error(`${type} could not be loaded.`);
        }
      } else if (status === 403) {
        return { ...data, permissions: { read: [], write: [] } };
      }
      return body;
    });
    // Map them to state
    const bucket = bid ? responses[0] : null;
    // No bucket? Stop processing further as it should never happen!
    if (bucket == null) {
      return;
    }
    const groupsResp = bid ? responses[1] : null;
    const collection = bid && cid ? responses[2] : null;
    const group = bid && gid ? responses[2] : null;
    const record = bid && cid && rid ? responses[3] : null;
    const groups = groupsResp !== null ? groupsResp.data : [];
    yield put(
      actions.routeLoadSuccess({ bucket, groups, collection, group, record })
    );
  } catch (error) {
    yield put(actions.routeLoadFailure());
    notifyError("Couldn't retrieve route resources.", error);
  }
}

export function* routeUpdated(
  getState: GetStateFn,
  action: ActionType<typeof actions.routeUpdated>
): SagaGen {
  const {
    session: { authenticated },
  } = getState();
  const { params, location } = action;
  const { token, payload } = params;

  // Check for a non-authenticated session; if we're requesting anything other
  // than the homepage, proceed with a redirection.
  if (!authenticated && location.pathname !== "/") {
    if (token && payload) {
      // We've just been redirected with an auth token and payload
      const { redirectURL } = JSON.parse(atob(payload));
      // Wait until we're actually authenticated
      yield take(SESSION_AUTHENTICATED);
      // Redirect to the initially requested URL (if any)
      if (redirectURL) {
        yield put(updatePath(redirectURL));
      } else {
        yield put(actions.redirectTo("home", {}));
      }
    } else {
      // We're requesting an app URL requiring authentication while we're not;
      // Store current requested URL, wait for user authentication then redirect
      yield put(storeRedirectURL(location.pathname));
      yield put(actions.redirectTo("home", {}));
      notifyInfo("Authentication required.");
      // pause until the user is authenticated
      yield take(SESSION_AUTHENTICATED);
      // Redirect the user to the initially requested URL
      yield put(updatePath(location.pathname));
      // Clear stored redirectURL
      yield put(storeRedirectURL(null));
    }
  } else {
    // Load route related resources
    yield call(loadRoute, params);

    // Side effect: scroll to page top on each route change
    yield call(scrollToTop);
  }
}

export function* routeRedirect(
  getState: GetStateFn,
  action: ActionType<typeof actions.redirectTo>
): SagaGen {
  const { name, params } = action;
  const next = url(name, params);
  const {
    router: {
      location: { pathname: current },
    },
  } = getState();
  if (next == current) {
    // In several places in the code base, we use redirectTo() with the current path
    // to refresh the state of the page (eg. refresh list after record deletion from the list).
    // In latest versions of react-router, redirecting to the same URL does not reload the page.
    // Tackling the issue at its core will happen in Kinto/kinto-admin#272
    // In the mean time, let's trick the router by going to a fake URL and replacing it immediately.
    yield put(updatePath("/--fake--"));
    yield put(replacePath(next));
  } else {
    yield put(updatePath(next));
  }
}
