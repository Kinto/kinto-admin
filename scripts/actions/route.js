/* @flow */

import type { Action, Bucket, Collection, Record } from "../types";

import {
  ROUTE_LOAD_SUCCESS,
  ROUTE_UPDATED,
} from "../constants";


export function routeLoadSuccess(
  bucket: Bucket,
  collection: Collection,
  record: Record
): Action {
  return {type: ROUTE_LOAD_SUCCESS, bucket, collection, record};
}

export function routeUpdated(
  authenticated: boolean,
  params: Object,
  location: Object
): Action {
  return {type: ROUTE_UPDATED, authenticated, params, location};
}
