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

export default class AuthForm extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {setup} = this.props;
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
}
