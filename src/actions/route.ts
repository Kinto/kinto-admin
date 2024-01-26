import {
  ROUTE_LOAD_FAILURE,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_REDIRECT,
  ROUTE_UPDATED,
} from "@src/constants";
import type {
  BucketResource,
  CollectionResource,
  GroupData,
  GroupResource,
  RecordResource,
  RouteParams,
  RouteResources,
} from "@src/types";
import type { Location } from "history";

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
