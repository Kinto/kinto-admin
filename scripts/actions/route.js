import {
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "../constants";


export function loadRoute(bid, cid, rid) {
  return {type: ROUTE_LOAD_REQUEST, bid, cid, rid};
}

export function routeLoadSuccess(bucket, collection, record) {
  return {type: ROUTE_LOAD_SUCCESS, bucket, collection, record};
}
