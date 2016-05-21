export function busy(busy) {
  return {type: "SESSION_BUSY", busy};
}

export function setup(session) {
  return {type: "SESSION_SETUP", session};
}

export function setupComplete(session) {
  return {type: "SESSION_SETUP_COMPLETE", session};
}

export function serverInfoSuccess(serverInfo) {
  return {type: "SESSION_SERVERINFO_SUCCESS", serverInfo};
}

export function serverInfoFailure(error) {
  return {type: "SESSION_SERVERINFO_FAILURE", error};
}

export function bucketsSuccess(buckets) {
  return {type: "SESSION_BUCKETS_SUCCESS", buckets};
}

export function bucketsFailure(error) {
  return {type: "SESSION_BUCKETS_FAILURE", error};
}

export function logout() {
  return {type: "SESSION_LOGOUT"};
}
