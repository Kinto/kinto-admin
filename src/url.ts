/* flow */
import type { RouteParams } from "@src/types";

const URLS = {
  // Root url
  home: () => "/",

  // Bucket urls
  buckets: () => "/buckets",
  "bucket:create": () => "/buckets/create",
  "bucket:attributes": ({ bid }) => `/buckets/${bid}/attributes`,
  "bucket:collections": ({ bid }) => `/buckets/${bid}/collections`,
  "bucket:groups": ({ bid }) => `/buckets/${bid}/groups`,
  "bucket:history": ({ bid }) => `/buckets/${bid}/history`,
  "bucket:permissions": ({ bid }) => `/buckets/${bid}/permissions`,

  // Group urls
  "group:create": ({ bid }) => `/buckets/${bid}/groups/create`,
  "group:attributes": ({ bid, gid }) =>
    `/buckets/${bid}/groups/${gid}/attributes`,
  "group:history": ({ bid, gid }) => `/buckets/${bid}/groups/${gid}/history`,
  "group:permissions": ({ bid, gid }) =>
    `/buckets/${bid}/groups/${gid}/permissions`,

  // Collection urls
  "collection:create": ({ bid }) => `/buckets/${bid}/collections/create`,
  "collection:attributes": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/attributes`,
  "collection:history": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/history`,
  "collection:permissions": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/permissions`,
  "collection:simple-review": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/simple-review`,
  "collection:compare": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/compare`,
  "collection:records": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/records`,

  // Record urls
  "record:create": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/records/create`,
  "record:bulk": ({ bid, cid }) =>
    `/buckets/${bid}/collections/${cid}/records/bulk`,
  "record:attributes": ({ bid, cid, rid }) =>
    `/buckets/${bid}/collections/${cid}/records/${rid}/attributes`,
  "record:history": ({ bid, cid, rid }) =>
    `/buckets/${bid}/collections/${cid}/records/${rid}/history`,
  "record:permissions": ({ bid, cid, rid }) =>
    `/buckets/${bid}/collections/${cid}/records/${rid}/permissions`,
};

export default function url(name: string, params: RouteParams): string {
  if (!Object.prototype.hasOwnProperty.call(URLS, name)) {
    throw new Error(`Unknown URL name: ${name}`);
  }
  return URLS[name](params);
}
