import type {
  OpenIDAuth,
  TokenAuth,
  PortierAuth,
  HomePageRouteMatch,
  SessionState,
  ServerEntry,
} from "../types";

import React, { PureComponent } from "react";

import * as ServersActions from "../actions/servers";
import * as NotificationActions from "../actions/notifications";
import * as SessionActions from "../actions/session";
import Spinner from "./Spinner";
import AuthForm from "./AuthForm";
import { isObject } from "../utils";

function ServerProps({ node }: { node: any }) {
  const nodes = Array.isArray(node)
    ? node.map((n, i) => [i, n])
    : Object.keys(node).map(key => [key, node[key]]);
  return (
    <table className="table table-condensed">
      <tbody>
        {nodes.map(([key, childNode], i) => {
          return (
            <tr key={i}>
              <th>{key}</th>
              <td style={{ width: "100%" }}>
                {isObject(childNode) || Array.isArray(childNode) ? (
                  <ServerProps node={childNode} />
                ) : typeof childNode === "string" &&
                  childNode.startsWith("http") ? (
                  <a href={childNode} target="_blank">
                    {childNode}
                  </a>
                ) : (
                  String(childNode)
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SessionInfo({ session: { serverInfo } }) {
  return (
    <div>
      <div className="card server-info-panel">
        <div className="card-header">
          <b>Server information</b>
        </div>
        <div className="card-body">
          <ServerProps node={serverInfo} />
        </div>
      </div>
    </div>
  );
}

export type OwnProps = {
  match: HomePageRouteMatch;
};

export type StateProps = {
  session: SessionState;
  servers: ServerEntry[];
};

export type Props = OwnProps &
  StateProps & {
    clearServers: typeof ServersActions.clearServers;
    setupSession: typeof SessionActions.setupSession;
    notifyError: typeof NotificationActions.notifyError;
    serverChange: typeof SessionActions.serverChange;
    getServerInfo: typeof SessionActions.getServerInfo;
    navigateToExternalAuth: typeof SessionActions.navigateToExternalAuth;
    navigateToOpenID: typeof SessionActions.navigateToOpenID;
  };

export default class HomePage extends PureComponent<Props> {
  componentDidMount = () => {
    // Check if the home page URL contains some payload/token data
    // coming from an *OpenID Connect* redirection.
    const {
      match: { params = {} as { payload?: string; token?: string } },
      setupSession,
      notifyError,
    } = this.props;
    const { payload } = params;
    let { token } = params;

    if (!payload || !token) {
      // No auth token found in URL.
      return;
    }
    // Check for an incoming authentication.
    try {
      let { server, authType } = JSON.parse(atob(payload));
      token = decodeURIComponent(token);

      let authData: OpenIDAuth | TokenAuth | PortierAuth;

      if (authType.startsWith("openid-")) {
        const provider = authType.split("-")[1]; // eg. `"openid-auth0"`.
        authType = "openid";
        let tokenType;
        let parsedToken;
        try {
          // Token is encoded in base64 for a safe path parsing.
          parsedToken = JSON.parse(atob(token));
          token = parsedToken.access_token;
          tokenType = parsedToken.token_type;
        } catch (e) {
          // Previous version of Kinto exposed the JSON directly in the URL.
          try {
            parsedToken = JSON.parse(token);
            token = parsedToken.access_token;
            tokenType = parsedToken.token_type;
          } catch (e) {
            throw new Error(`Token doesn't seems to be a valid JSON: {token}`);
          }
        }
        authData = {
          authType,
          server,
          provider,
          tokenType,
          credentials: { token },
        };
      } else if (authType == "fxa") {
        authData = {
          authType: "fxa",
          server,
          credentials: { token },
        };
      } else if (authType == "portier") {
        authData = {
          authType: "portier",
          server,
          credentials: { token },
        };
      } else {
        throw new Error(`Unsupported token authentication "${authType}"`);
      }
      // This action is bound with the setupSession() saga, which will
      // eventually lead to a call to setupClient() that globally sets
      // the headers of the API client.
      setupSession(authData);
    } catch (error) {
      const message = "Couldn't proceed with authentication.";
      notifyError(message, error);
    }
  };

  render() {
    const {
      session,
      servers,
      clearServers,
      setupSession,
      serverChange,
      getServerInfo,
      navigateToExternalAuth,
      navigateToOpenID,
    } = this.props;
    const { authenticated, authenticating, serverInfo } = session;
    const { project_name } = serverInfo;
    return (
      <div>
        <h1>{`${project_name} Administration`}</h1>
        {authenticating ? (
          <Spinner />
        ) : authenticated ? (
          <SessionInfo session={session} />
        ) : (
          <AuthForm
            setupSession={setupSession}
            serverChange={serverChange}
            getServerInfo={getServerInfo}
            session={session}
            servers={servers}
            clearServers={clearServers}
            navigateToExternalAuth={navigateToExternalAuth}
            navigateToOpenID={navigateToOpenID}
          />
        )}
      </div>
    );
  }
}
