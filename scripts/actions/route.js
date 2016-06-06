import {
  ROUTE_LOAD_SUCCESS,
  ROUTE_UPDATED,
} from "../constants";


export function routeLoadSuccess(bucket, collection, record) {
  return {type: ROUTE_LOAD_SUCCESS, bucket, collection, record};
}

export function routeUpdated(authenticated, params, location) {
  return {type: ROUTE_UPDATED, authenticated, params, location};
}
