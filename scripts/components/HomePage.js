import React, { Component } from "react";

import Form from "react-jsonschema-form";


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
    <Form
      schema={schema}
      uiSchema={uiSchema}
      onSubmit={({formData}) => setup(formData)} />
  );
}

function SessionInfo(props) {
  const {logout, session} = props;
  const {username, serverInfo} = session;
  return (
    <div>
      <p>Welcome back, <strong>{username}</strong> (
        <a href="#"
          onClick={(event) => event.preventDefault() || logout()}>logout</a>
      ).</p>
      <h3>Server information</h3>
      <pre>{JSON.stringify(serverInfo, null, 2)}</pre>
    </div>
  );
}

export default class HomePage extends Component {
  render() {
    const {session, setup, logout} = this.props;
    const {authenticated} = session;
    return <div>
      <h1>Kinto Web Administration Console</h1>
      {authenticated ?
        <SessionInfo session={session} logout={logout} /> :
        <SetupForm setup={setup} />}
    </div>;
  }
}
