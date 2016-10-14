/* @flow */

const URLS = {
  home: () =>
    "/",
  collectionRecords: ({bid, cid}) =>
    `/buckets/${bid}/collections/${cid}/records`,
  recordAttributes: ({bid, cid, rid}) =>
    `/buckets/${bid}/collections/${cid}/records/${rid}/attributes`,
};

export default function url(name: string, params: Object): string {
  return URLS[name](params);
}
