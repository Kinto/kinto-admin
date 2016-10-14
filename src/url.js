/* flow */

import type { RouteParams } from "./types";


const URLS = {
  home: () =>
    "/",
  "collection:records": ({bid, cid}) =>
    `/buckets/${bid}/collections/${cid}/records`,
  "record:attributes": ({bid, cid, rid}) =>
    `/buckets/${bid}/collections/${cid}/records/${rid}/attributes`,
};

export default function url(name: string, params: RouteParams): string {
  return URLS[name](params);
}
