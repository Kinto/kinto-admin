import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";


// XXX: remove defaults
const schema = {
  type: "object",
  title: "Setup",
  required: ["server", "username", "password"],
  properties: {
    server:   {
      type: "string",
      title: "Server",
      format: "uri",
      description: "http://",
      default: "https://kinto.dev.mozaws.net/v1/"
    },
    username: {
      type: "string",
      title: "Username",
      default: "test",
    },
    password: {
      type: "string",
      title: "Password",
      default: "test",
    }
  }
};

const uiSchema = {
  password: {"ui:widget": "password"}
};

function SetupForm(props) {
  const {setup} = props;
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={({formData}) => setup(formData)} />
      </div>
    </div>
  );
}

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
    const {session, setup} = this.props;
    const {authenticated, busy} = session;
    return <div>
      <h1>Kinto Web Administration Console</h1>
      {authenticated ?
        <SessionInfo session={session} /> :
        busy ? <Spinner /> : <SetupForm setup={setup} />}
    </div>;
  }
}
