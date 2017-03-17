/* @flow */
import type { SessionState, SettingsState } from "../types";

import React, { PureComponent } from "react";

import BaseForm from "./BaseForm";
import { omit } from "../utils";

class ServerHistory extends PureComponent {
  state: {
    menuOpened: boolean,
  };

  constructor(props) {
    super(props);
    this.state = { menuOpened: false };
  }

  select = server => {
    return event => {
      event.preventDefault();
      this.props.onChange(server);
      this.setState({ menuOpened: false });
    };
  };

  toggleMenu = () => {
    this.setState({ menuOpened: !this.state.menuOpened });
  };

  clear = event => {
    event.preventDefault();
    const { clearHistory } = this.props.options;
    clearHistory();
    this.setState({ menuOpened: false });
  };

  render() {
    const { menuOpened } = this.state;
    const { id, value, onChange, placeholder, options } = this.props;
    const { history } = options;
    return (
      <div className="input-group">
        <input
          type="text"
          id={id}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={event => onChange(event.target.value)}
        />
        <div className={`input-group-btn ${menuOpened ? "open" : ""}`}>
          <button
            type="button"
            className="btn btn-default dropdown-toggle"
            onClick={this.toggleMenu}>
            <span className="caret" />
          </button>
          <ul className="dropdown-menu dropdown-menu-right">
            {history.length === 0
              ? <li>
                  <a onClick={this.toggleMenu}><em>No server history</em></a>
                </li>
              : history.map((server, key) => (
                  <li key={key}>
                    <a href="#" onClick={this.select(server)}>{server}</a>
                  </li>
                ))}
            <li role="separator" className="divider" />
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
    server: {
      type: "string",
      title: "Server",
      format: "uri",
    },
    authType: {
      type: "string",
      title: "Authentication method",
      enum: ["basicauth", "fxa", "ldap"],
    },
  },
};

const baseUISchema = {
  server: {
    "ui:placeholder": "https://",
  },
  authType: {
    "ui:widget": "radio",
  },
};

const authSchemas = {
  basicauth: {
    schema: {
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
            },
          },
        },
      },
    },
    uiSchema: {
      ...baseUISchema,
      credentials: {
        password: { "ui:widget": "password" },
      },
    },
  },
  anonymous: {
    schema: {
      ...baseAuthSchema,
    },
    uiSchema: {
      ...baseUISchema,
    },
  },
  fxa: {
    schema: {
      ...baseAuthSchema,
      properties: {
        ...baseAuthSchema.properties,
      },
    },
    uiSchema: {
      authType: {
        ...baseUISchema.authType,
        "ui:help": (
          <span>
            <b>Note:</b> The
            <a href="https://github.com/mozilla-services/kinto-fxa">
              {" kinto-fxa "}
            </a>
            plugin must be installed on the target server.
          </span>
        ),
      },
    },
  },
  ldap: {
    schema: {
      ...baseAuthSchema,
      required: [...baseAuthSchema.required, "credentials"],
      properties: {
        ...baseAuthSchema.properties,
        credentials: {
          type: "object",
          title: "LDAP credentials",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              title: "Email",
              default: "jdoe@mozilla.com",
            },
            password: {
              type: "string",
              title: "Password",
            },
          },
        },
      },
    },
    uiSchema: {
      ...baseUISchema,
      credentials: {
        password: { "ui:widget": "password" },
      },
    },
  },
  portier: {
    schema: {
      ...baseAuthSchema,
      required: [...baseAuthSchema.required, "email"],
      properties: {
        ...baseAuthSchema.properties,
        email: {
          title: "Email address",
          type: "string",
          format: "email",
        },
      },
    },
    uiSchema: {
      authType: {
        ...baseUISchema.authType,
        "ui:help": (
          <span>
            <b>Note:</b> The
            <a href="https://github.com/Kinto/kinto-portier">
              {" kinto-portier "}
            </a>
            plugin must be installed on the target server.
          </span>
        ),
      },
    },
  },
};

const authLabels = {
  anonymous: "Anonymous",
  basicauth: "Basic Auth",
  fxa: "Firefox Account",
  ldap: "LDAP",
  portier: "Portier",
};

/**
 * Use the server history for the default server field value when available.
 */
function extendSchemaWithHistory(schema, history, authMethods, singleServer) {
  const defaultServer = "https://kinto.dev.mozaws.net/v1/";
  const serverURL = singleServer || history[0] || defaultServer;
  return {
    ...schema,
    properties: {
      ...schema.properties,
      authType: {
        ...schema.properties.authType,
        enum: authMethods,
        enumNames: authMethods.map(a => authLabels[a]),
      },
      server: {
        ...schema.properties.server,
        default: serverURL,
      },
    },
  };
}

/**
 * Use the server history for the default server field value when available.
 */
function extendUiSchemaWithHistory(
  uiSchema,
  history,
  clearHistory,
  singleServer,
  singleAuthMethod
) {
  const authType = {
    authType: {
      ...uiSchema.authType,
      "ui:widget": singleAuthMethod ? "hidden" : "radio",
    },
  };

  if (singleServer) {
    return {
      ...uiSchema,
      ...authType,
      server: {
        "ui:widget": "hidden",
      },
    };
  }
  return {
    ...uiSchema,
    ...authType,
    server: {
      ...uiSchema.server,
      "ui:widget": ServerHistory,
      "ui:options": { history, clearHistory },
    },
  };
}

export default class AuthForm extends PureComponent {
  props: {
    session: SessionState,
    history: string[],
    settings: SettingsState,
    setup: (session: Object) => void,
    navigateToExternalAuth: (authFormData: Object) => void,
    clearHistory: () => void,
  };

  state: {
    schema: Object,
    uiSchema: Object,
    formData: Object,
  };

  defaultProps = {
    history: [],
  };

  constructor(props: Object) {
    super(props);
    const { settings: { authMethods } } = this.props;
    const defaultAuth = authMethods[0];
    const { schema, uiSchema } = authSchemas[defaultAuth];
    this.state = {
      schema,
      uiSchema,
      formData: { authType: defaultAuth },
    };
  }

  onChange = ({ formData }: { formData: Object }) => {
    const { authType } = formData;
    const { schema, uiSchema } = authSchemas[authType];
    const specificFormData = ["anonymous", "fxa", "portier"].includes(authType)
      ? omit(formData, ["credentials"])
      : { credentials: {}, ...formData };
    return this.setState({
      schema,
      uiSchema,
      formData: specificFormData,
    });
  };

  onSubmit = ({ formData }: { formData: Object }) => {
    const { session, setup, navigateToExternalAuth } = this.props;
    const { authType } = formData;
    const { redirectURL } = session;
    const extendedFormData = { ...formData, redirectURL };
    switch (authType) {
      case "fxa":
      case "portier": {
        return navigateToExternalAuth(extendedFormData);
      }
      // case "anonymous":
      // case "ldap":
      // case "basicauth":
      default: {
        return setup(extendedFormData);
      }
    }
  };

  render() {
    const { history, clearHistory, settings } = this.props;
    const { schema, uiSchema, formData } = this.state;
    const { singleServer, authMethods } = settings;
    const singleAuthMethod = authMethods.length === 1;
    const finalSchema = extendSchemaWithHistory(
      schema,
      history,
      authMethods,
      singleServer
    );
    const finalUiSchema = extendUiSchemaWithHistory(
      uiSchema,
      history,
      clearHistory,
      singleServer,
      singleAuthMethod
    );
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <BaseForm
            schema={finalSchema}
            uiSchema={finalUiSchema}
            formData={formData}
            onChange={this.onChange}
            onSubmit={this.onSubmit}>
            <button type="submit" className="btn btn-info">
              {"Sign in using "}{authLabels[formData.authType]}
            </button>
          </BaseForm>
        </div>
      </div>
    );
  }
}
