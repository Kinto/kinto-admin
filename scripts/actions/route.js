import {
  ROUTE_LOAD_REQUEST,
} from "../constants";


export function loadRoute(bid, cid, rid) {
  return {type: ROUTE_LOAD_REQUEST, bid, cid, rid};
}
