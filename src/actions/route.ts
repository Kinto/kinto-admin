import type {
  RouteParams,
  RouteResources,
  BucketResource,
  GroupData,
  CollectionResource,
  RecordResource,
  GroupResource,
} from "../types";
import type { Location } from "history";

import {
  ROUTE_UPDATED,
  ROUTE_REDIRECT,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";

export function routeUpdated(
  params: any,
  location: Location
): {
  type: "ROUTE_UPDATED";
  params: any;
  location: Location;
} {
  return { type: ROUTE_UPDATED, params, location };
}

export function routeLoadRequest(params: RouteParams): {
  type: "ROUTE_LOAD_REQUEST";
  params: RouteParams;
} {
  return { type: ROUTE_LOAD_REQUEST, params };
}

export function routeLoadSuccess(routeResources: RouteResources): {
  type: "ROUTE_LOAD_SUCCESS";
  bucket: BucketResource;
  groups: GroupData[];
  collection: CollectionResource | null | undefined;
  record: RecordResource | null | undefined;
  group: GroupResource | null | undefined;
} {
  return { type: ROUTE_LOAD_SUCCESS, ...routeResources };
}

export function routeLoadFailure(): {
  type: "ROUTE_LOAD_FAILURE";
} {
  return { type: ROUTE_LOAD_FAILURE };
}

export function redirectTo(
  name: string,
  params: RouteParams
): {
  type: "ROUTE_REDIRECT";
  name: string;
  params: RouteParams;
} {
  return { type: ROUTE_REDIRECT, name, params };
}
