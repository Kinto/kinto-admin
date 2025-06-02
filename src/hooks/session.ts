import { notifyError, notifyInfo } from "./notifications";
import { getClient, setupClient } from "@src/client";
import {
  AuthData,
  OpenIDAuth,
  PermissionsListEntry,
  ServerInfo,
} from "@src/types";
import { makeObservable } from "@src/utils";
import { useEffect, useState } from "react";
import { useLocalStorage } from "./storage";

let authState = makeObservable(undefined);
let permissionState = makeObservable(undefined);
let serverState = makeObservable(undefined);

export function setAuth(auth: AuthData) {
  authState.set(auth);
}

export function logout() {
  authState.set(undefined);
  permissionState.set(undefined);
  serverState.set(undefined);
}

export function useAuth() : AuthData | undefined {
  const [val, setVal] = useLocalStorage("kinto-admin-auth", authState.get());

  useEffect(() => {
    return authState.subscribe(setVal);
  }, []);

  return val;
}

export function usePermissions() : PermissionsListEntry[] | undefined {
  const [val, setVal] = useState(permissionState.get());

  useEffect(() => {
    const unsub = permissionState.subscribe(setVal);
    if (serverState.get() !== undefined && val === undefined) {
      getPermissions(serverState.get());
    }
    return unsub;
  }, [serverState.get() !== undefined]);

  return val;
}

async function getPermissions(server: ServerInfo) {
  if (!server.capabilities?.permissions_endpoint) {
    notifyInfo("Permissions endpoint is not enabled on server, listed resources in the sidebar might be incomplete.");
    permissionState.set([]);
  }
  const { data: permissions } = await getClient().listPermissions({
    pages: Infinity,
    filters: { exclude_resource_name: "record,group" },
  });
  permissionState.set(permissions);
}

export function useServerInfo(): ServerInfo | undefined {
  const [val, setVal] = useState(serverState.get());

  useEffect(() => {
    const unsub = serverState.subscribe(setVal);
    if (authState.get() !== undefined && val === undefined) {
      getServerInfo(authState.get());
    }
    return unsub;
  }, [authState.get() !== undefined]);

  return val;
}

async function getServerInfo(auth: AuthData) {
  let processedAuth: AuthData = auth;
  if (auth.authType.startsWith("openid-")) {
    const openIDAuth: OpenIDAuth = {
      authType: "openid",
      provider: auth.authType.replace("openid-", ""),
      server: auth.server,
      // $FlowFixMe we know we are dealing with openid, Flow does not.
      tokenType: (auth as { tokenType: string }).tokenType,
      // $FlowFixMe
      credentials: (auth as { credentials: { token: string } }).credentials,
    };
    processedAuth = openIDAuth;
  }

  // Set the client globally to the entire app, when the saga starts.
  // We'll compare the remote of this singleton when the server info will be received
  // to prevent race conditions.
  const client = setupClient(processedAuth || auth);

  try {
    // Fetch server information
    let serverInfo = await client.fetchServerInfo();

    // Take the project name from the server. Use "Kinto" if default ("kinto") is used.
    const { project_name: rawProjectName } = serverInfo;
    const project_name = rawProjectName == "kinto" ? "Kinto" : rawProjectName;
    serverInfo = { ...serverInfo, project_name };
    // Side effect: change window title with project name.
    document.title = project_name + " Administration";

    // Check that the client was not changed in the mean time. This could happen if a request to
    // another server was sent after the current one, but took less time to answer.
    // In such a case, this means this saga/server request should be discarded in favor of the other one
    // which was sent later.
    const currentClient = getClient();
    if (client.remote != currentClient.remote) {
      return;
    }

    serverState.set(serverInfo);
  } catch (error) {
    // As above, we want to ignore this result, if another request was sent in the mean time.
    const currentClient = getClient();
    if (client.remote != currentClient.remote) {
      return;
    }

    notifyError(`Could not reach server ${auth.server}`, error);
  }
}
