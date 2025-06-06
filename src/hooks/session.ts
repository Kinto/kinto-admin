import { notifyError, notifyInfo } from "./notifications";
import { addServer } from "./servers";
import { useLocalStorage } from "./storage";
import { getClient, setupClient } from "@src/client";
import {
  AuthData,
  OpenIDAuth,
  PermissionsListEntry,
  ServerInfo,
} from "@src/types";
import { makeObservable } from "@src/utils";
import { useEffect, useState } from "react";

const openPromises = {};

let authState = makeObservable(undefined);
let permissionState = makeObservable(undefined);
let serverState = makeObservable(undefined);

export function setAuth(auth: AuthData) {
  addServer(
    auth.server,
    auth.authType === "openid"
      ? `${auth.authType}-${auth.provider}`
      : auth.authType
  );

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

  setupClient(processedAuth);
  authState.set(processedAuth);
}

export function logout() {
  authState.set(undefined);
  permissionState.set(undefined);
  serverState.set(undefined);
}

export function useAuth(): AuthData | undefined {
  const [val, setVal] = useLocalStorage("kinto-admin-auth", authState.get());

  useEffect(() => {
    if (authState.get() === undefined && val !== undefined) {
      authState.set(val);
      setupClient(val);
    }
    return authState.subscribe(setVal);
  }, []);

  return val;
}

export function usePermissions(): PermissionsListEntry[] | undefined {
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
  if (openPromises["getPermissions"]) {
    return;
  }

  openPromises["getPermissions"] = true;
  try {
    if (!server.capabilities?.permissions_endpoint) {
      notifyInfo(
        "Permissions endpoint is not enabled on server, listed resources in the sidebar might be incomplete."
      );
      permissionState.set([]);
    }
    const { data: permissions } = await getClient().listPermissions({
      pages: Infinity,
      filters: { exclude_resource_name: "record,group" },
    });
    permissionState.set(permissions);
  } catch (ex) {
    notifyError("Unable to load permissions", ex);
  } finally {
    delete openPromises["getPermissions"];
  }
}

export function useServerInfo(): ServerInfo | undefined {
  const [val, setVal] = useState(serverState.get());

  useEffect(() => {
    const unsub = serverState.subscribe(setVal);
    if (authState.get() !== undefined && val === undefined) {
      getServerInfo();
    }
    return unsub;
  }, [authState.get() !== undefined]);

  return val;
}

async function getServerInfo() {
  if (openPromises["getServerInfo"]) {
    return;
  }
  openPromises["getServerInfo"] = true;

  const client = getClient();

  try {
    // Fetch server information
    let serverInfo = await client.fetchServerInfo();

    // Take the project name from the server. Use "Kinto" if default ("kinto") is used.
    const { project_name: rawProjectName } = serverInfo;
    const project_name = rawProjectName == "kinto" ? "Kinto" : rawProjectName;
    serverInfo = { ...serverInfo, project_name };
    // Side effect: change window title with project name.
    document.title = project_name + " Administration";

    serverState.set(serverInfo);
  } catch (error) {
    notifyError(`Could not reach server ${client.remote}`, error);
  } finally {
    delete openPromises["getServerInfo"];
  }
}
