export function setup(session) {
  return {type: "SESSION_SETUP", session};
}

export function serverInfoLoaded(serverInfo) {
  return {type: "SESSION_SERVER_INFO_LOADED", serverInfo};
}

export function bucketListLoaded(buckets) {
  return {type: "SESSION_BUCKETS_LIST_LOADED", buckets};
}

export function logout() {
  return {type: "SESSION_LOGOUT"};
}
