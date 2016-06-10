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
      // default: "http://0.0.0.0:8888/v1/"
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

const baseUISchema = {
  authType: {
    "ui:widget": "radio",
  }
};

const basicAuthUISchema = {
  ...baseUISchema,
  credentials: {
    password: {"ui:widget": "password"}
  }
};

const fxaUISchema = {
  authType: {
    ...baseUISchema.authType,
    "ui:help": (
      <span>
        <b>Note:</b> The
        <a href="https://github.com/mozilla-services/kinto-fxa">{" kinto-fxa "}</a>
        plugin must be installed on the target server.
      </span>
    )
  }
};

const btnLabels = {
  "basicauth": "Sign in using Basic Auth",
  "fxa": "Sign in using your Firefox Account",
};

export default class AuthForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: basicAuthSchema,
      uiSchema: basicAuthUISchema,
      formData: {authType: "basicauth"},
    };
  }

  onChange = ({formData}) => {
    const {server, authType, credentials={}} = formData;
    switch(authType) {
      case "fxa": {
        return this.setState({
          schema: fxaSchema,
          uiSchema: fxaUISchema,
          formData: {authType, server},
        });
      }
      default:
      case "basicauth": {
        return this.setState({
          schema: basicAuthSchema,
          uiSchema: basicAuthUISchema,
          formData: {authType, server, credentials},
        });
      }
    }
  }

  onSubmit = ({formData}) => {
    const {session, setup, navigateToExternalAuth} = this.props;
    const {authType} = formData;
    const {redirectURL} = session;
    const extendedFormData = {...formData, redirectURL};
    switch(authType) {
      case "fxa": {
        return navigateToExternalAuth(extendedFormData);
      }
      default:
      case "basicauth": {
        return setup(extendedFormData);
      }
    }
  };

  render() {
    const {schema, uiSchema, formData} = this.state;
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <Form
            schema={schema}
            formData={formData}
            onChange={this.onChange}
            uiSchema={uiSchema}
            onSubmit={this.onSubmit}>
            <button type="submit" className="btn btn-info">
              {btnLabels[formData.authType]}
            </button>
          </Form>
        </div>
      </div>
    );
  }
}
