/* @flow */
import type {
  HomePageRouteMatch,
  SessionState,
  SettingsState,
  ServerHistoryEntry,
} from "../types";

import React, { PureComponent } from "react";

import Spinner from "./Spinner";
import AuthForm from "./AuthForm";
import { isObject } from "../utils";

function ServerProps({ node }: { node: Object }) {
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

function SessionInfo({ session: { busy, serverInfo } }) {
  return (
    <div>
      {busy ? (
        <Spinner />
      ) : (
        <div className="panel server-info-panel panel-default">
          <div className="panel-heading">
            <b>Server information</b>
          </div>
          <div className="panel-body">
            <ServerProps node={serverInfo} />
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  match: HomePageRouteMatch,
  session: SessionState,
  settings: SettingsState,
  history: ServerHistoryEntry[],
  clearHistory: () => void,
  setupSession: (session: Object) => void,
  notifyError: (message: string, error: Error) => void,
  serverChange: () => void,
  getServerInfo: (auth: Object) => void,
  navigateToExternalAuth: (authFormData: Object) => void,
  navigateToOpenID: (authFormData: Object, provider: Object) => void,
};

export default class HomePage extends PureComponent<Props> {
  componentDidMount = () => {
    // Check if the home page URL contains some payload/token data
    // coming from an *OpenID Connect* redirection.
    const {
      match: { params = {} },
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
      const { server, authType } = JSON.parse(atob(payload));
      token = decodeURIComponent(token);
      let tokenType;
      if (authType.startsWith("openid-")) {
        const parsedToken = JSON.parse(token);
        token = parsedToken.access_token;
        tokenType = parsedToken.token_type;
      }
      const credentials = { token };
      // This action is bound with the setupSession() saga, which will
      // eventually lead to a call to setupClient() that globally sets
      // the headers of the API client.
      setupSession({ server, authType, credentials, tokenType });
    } catch (error) {
      const message = "Couldn't proceed with authentication.";
      notifyError(message, error);
    }
  };

  render() {
    const {
      session,
      history,
      settings,
      clearHistory,
      setupSession,
      serverChange,
      getServerInfo,
      navigateToExternalAuth,
      navigateToOpenID,
    } = this.props;
    const { authenticated, busy, serverInfo } = session;
    const { project_name } = serverInfo;
    return (
      <div>
        <h1>{`${project_name} Administration`}</h1>
        {busy ? (
          <Spinner />
        ) : authenticated ? (
          <SessionInfo session={session} />
        ) : (
          <AuthForm
            setupSession={setupSession}
            serverChange={serverChange}
            getServerInfo={getServerInfo}
            session={session}
            settings={settings}
            history={history}
            clearHistory={clearHistory}
            navigateToExternalAuth={navigateToExternalAuth}
            navigateToOpenID={navigateToOpenID}
          />
        )}
      </div>
    );
  }
}
