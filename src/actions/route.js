/* @flow */

import type { Action } from "../types";

import { ROUTE_UPDATED } from "../constants";


export function routeUpdated(
  params: Object,
  location: Object
): Action {
  return {type: ROUTE_UPDATED, params, location};
}
