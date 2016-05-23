import React, { Component } from "react";

import Form from "react-jsonschema-form";


const baseAuthSchema = {
  type: "object",
  title: "Setup",
  required: ["server", "authType"],
  properties: {
    server:   {
      type: "string",
      title: "Server",
      format: "uri",
      description: "http://",
      default: "https://kinto.dev.mozaws.net/v1/"
    },
    authType: {
      type: "string",
      title: "Authentication method",
      enum: ["basicauth", "fxa"],
      enumNames: ["Basic Auth", "Firefox Account"],
    }
  }
};

const basicAuthSchema = {
  ...baseAuthSchema,
  required: [...baseAuthSchema.required, "credentials"],
  properties: {
    ...baseAuthSchema.properties,
    credentials: {
      type: "object",
      title: "BasicAuth credentials",
      required: ["username", "password"],
      properties: {
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
    }
  }
};

const fxaSchema = {
  ...baseAuthSchema,
  properties: {
    ...baseAuthSchema.properties,
  }
};

const uiSchema = {
  password: {"ui:widget": "password"}
};

export default class AuthForm extends Component {
  constructor(props) {
    super(props);
    this.state = {schema: basicAuthSchema, formData: {}};
  }

  onChange = ({formData}) => {
    const {authType} = formData;
    switch(authType) {
      case "fxa": {
        return this.setState({schema: fxaSchema, formData});
      }
      default:
      case "basicauth": {
        return this.setState({schema: basicAuthSchema, formData});
      }
    }
  }

  onSubmit = ({formData}) => {
    const {setup} = this.props;
    const {authType, server} = formData;
    switch(authType) {
      case "fxa": {
        const {origin, pathname} = document.location;
        try {
          const payload = btoa(JSON.stringify(formData));
          const redirect = encodeURIComponent(`${origin}${pathname}#/auth/${payload}/`);
          document.location = `${server}/fxa-oauth/login?redirect=${redirect}`;
        } catch(error) {
          // XXX Notify
        }
        return;
      }
      default:
      case "basicauth": {
        return setup(formData);
      }
    }
  };

  render() {
    const {schema, formData} = this.state;
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <Form
            schema={schema}
            formData={formData}
            onChange={this.onChange}
            uiSchema={uiSchema}
            onSubmit={this.onSubmit} />
        </div>
      </div>
    );
  }
}
