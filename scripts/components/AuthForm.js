import React, { Component } from "react";

import Form from "react-jsonschema-form";


class ServerHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {menuOpened: false};
  }

  select = (server) => {
    return (event) => {
      event.preventDefault();
      this.props.onChange(server);
      this.setState({menuOpened: false});
    };
  }

  toggleMenu = () => {
    this.setState({menuOpened: !this.state.menuOpened});
  }

  clear = (event) => {
    event.preventDefault();
    const {clearHistory} = this.props.options;
    clearHistory();
    this.setState({menuOpened: false});
  }

  render() {
    const {menuOpened} = this.state;
    const {id, value, onChange, options} = this.props;
    const {history} = options;
    return (
      <div className="input-group">
        <input type="text"
          id={id}
          className="form-control"
          value={value}
          onChange={(event) => onChange(event.target.value)} />
        <div className={`input-group-btn ${menuOpened ? "open" : ""}`}>
          <button type="button" className="btn btn-default dropdown-toggle"
            onClick={this.toggleMenu}>
            <span className="caret"></span>
          </button>
          <ul className="dropdown-menu dropdown-menu-right">
            {
              history.length === 0 ? (
                <li><a onClick={this.toggleMenu}><em>No server history</em></a></li>
              ) : history.map((server, key) => (
                <li key={key}><a href="#" onClick={this.select(server)}>{server}</a></li>
              ))
            }
            <li role="separator" className="divider"></li>
            <li><a href="#" onClick={this.clear}>Clear</a></li>
          </ul>
        </div>
      </div>
    );
  }
}

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

/**
 * Use the server history for the default server field value when available.
 */
function extendSchemaWithHistory(schema, history) {
  return {
    ...schema,
    properties: {
      ...schema.properties,
      server: {
        ...schema.properties.server,
        default: history[0] || schema.properties.server.default
      }
    }
  };
}

/**
 * Use the server history for the default server field value when available.
 */
function extendUiSchemaWithHistory(uiSchema, history, clearHistory) {
  return {
    ...uiSchema,
    server: {
      "ui:widget": {
        component: ServerHistory,
        options: {history, clearHistory}
      }
    }
  };
}

export default class AuthForm extends Component {
  defaultProps = {
    history: []
  };

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
    const {history, clearHistory} = this.props;
    const {schema, uiSchema, formData} = this.state;
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <Form
            schema={extendSchemaWithHistory(schema, history)}
            uiSchema={extendUiSchemaWithHistory(uiSchema, history, clearHistory)}
            formData={formData}
            onChange={this.onChange}
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
