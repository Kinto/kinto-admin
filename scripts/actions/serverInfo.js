import * as NotificationsActions from "./notifications";

export const SERVERINFO_LOADED = "SERVERINFO_LOADED";
export const SERVERINFO_RESET = "SERVERINFO_RESET";


export function serverInfoLoaded(serverInfo) {
  return {
    type: SERVERINFO_LOADED,
    serverInfo,
  };
}

export function resetServerInfo() {
  return {
    type: SERVERINFO_RESET,
  };
}

export function loadServerInfo(server) {
  if (server[server.length - 1] !== "/") {
    server = server + "/";
  }
  return dispatch => {
    dispatch(resetServerInfo());
    fetch(server)
      .then(res => {
        return res.json();
      })
      .then(serverInfo => {
        dispatch(serverInfoLoaded(serverInfo));
      })
      .catch(err => {
        dispatch(NotificationsActions.notifyError(err));
      });
  };
}
