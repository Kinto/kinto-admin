/* @flow */
import type { SessionState, SettingsState } from "../types";

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
                {isObject(childNode) || Array.isArray(childNode)
                  ? <ServerProps node={childNode} />
                  : typeof childNode === "string" &&
                      childNode.startsWith("http")
                      ? <a href={childNode} target="_blank">{childNode}</a>
                      : String(childNode)}
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
      {busy
        ? <Spinner />
        : <div className="panel server-info-panel panel-default">
            <div className="panel-heading"><b>Server information</b></div>
            <div className="panel-body">
              <ServerProps node={serverInfo} />
            </div>
          </div>}
    </div>
  );
}

export default class HomePage extends PureComponent {
  props: {
    session: SessionState,
    settings: SettingsState,
    history: string[],
    clearHistory: () => void,
    setup: (session: Object) => void,
    navigateToExternalAuth: (authFormData: Object) => void,
  };

  render() {
    const {
      session,
      history,
      settings,
      clearHistory,
      setup,
      navigateToExternalAuth,
    } = this.props;
    const { authenticated, busy } = session;
    return (
      <div>
        <h1>Kinto Web Administration Console</h1>
        {busy
          ? <Spinner />
          : authenticated
              ? <SessionInfo session={session} />
              : <AuthForm
                  setup={setup}
                  session={session}
                  settings={settings}
                  history={history}
                  clearHistory={clearHistory}
                  navigateToExternalAuth={navigateToExternalAuth}
                />}
      </div>
    );
  }
}
