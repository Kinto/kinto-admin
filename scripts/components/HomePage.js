import React, { Component } from "react";

import Spinner from "./Spinner";
import AuthForm from "./AuthForm";


function ServerProps({serverInfo}) {
  return (
    <table className="table table-condensed">
      <tbody>{
        Object.keys(serverInfo).map((prop, i) => {
          const serverProp = serverInfo[prop];
          return (
            <tr key={i}>
              <th>{prop}</th>
              <td style={{width: "100%"}}>{
                typeof serverProp === "object" ?
                  <ServerProps serverInfo={serverProp} /> :
                  typeof serverProp === "string" && serverProp.startsWith("http") ?
                    <a href={serverProp} target="_blank">{serverProp}</a> :
                    String(serverProp)
              }</td>
            </tr>
          );
        })
      }</tbody>
    </table>
  );
}

function SessionInfo(props) {
  const {session} = props;
  const {busy, serverInfo} = session;
  return (
    <div>
      {busy ? <Spinner /> :
        <div className="panel server-info-panel panel-default">
          <div className="panel-heading"><b>Server information</b></div>
          <div className="panel-body">
            <ServerProps serverInfo={serverInfo} />
          </div>
        </div>}
    </div>
  );
}

export default class HomePage extends Component {
  render() {
    const {session, history, setup, navigateToExternalAuth} = this.props;
    const {authenticated, busy} = session;
    return (
      <div>
        <h1>Kinto Web Administration Console</h1>
        {busy ? <Spinner /> :
          authenticated ?
            <SessionInfo session={session} /> :
            <AuthForm setup={setup}
                      session={session}
                      history={history}
                      navigateToExternalAuth={navigateToExternalAuth} />}
      </div>
    );
  }
}
