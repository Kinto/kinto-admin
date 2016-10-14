/* @flow */

import type { RouteParams, RouteResources, Action } from "../types";

import {
  ROUTE_UPDATED,
  ROUTE_REDIRECT,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../constants";


export function routeUpdated(
  params: Object,
  location: Object
): Action {
  return {type: ROUTE_UPDATED, params, location};
}

export function routeLoadRequest(params: RouteParams): Action {
  return {type: ROUTE_LOAD_REQUEST, params};
}

export function routeLoadSuccess(routeResources: RouteResources): Action {
  return {type: ROUTE_LOAD_SUCCESS, ...routeResources};
}

export function routeLoadFailure(): Action {
  return {type: ROUTE_LOAD_FAILURE};
}

export function redirectTo(name: string, params: RouteParams): Action {
  return {type: ROUTE_REDIRECT, name, params};
}
