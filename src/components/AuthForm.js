/* @flow */
import type { SessionState, SettingsState } from "../types";

import React, { PureComponent } from "react";

import BaseForm from "./BaseForm";
import { debounce, omit } from "../utils";

const DEFAULT_KINTO_SERVER = "https://kinto.dev.mozaws.net/v1/";
const ANONYMOUS_AUTH = "anonymous";
const anonymousAuthData = server => ({
  authType: ANONYMOUS_AUTH,
  server: server,
});
const KNOWN_AUTH_METHODS = ["basicauth", "account", "fxa", "ldap", "portier"];

type ServerHistoryProps = {
  id: string,
  value: string,
  placeholder: string,
  options: Object,
  onChange: string => void,
};

type ServerHistoryState = {
  menuOpened: boolean,
};

class ServerHistory extends PureComponent<
  ServerHistoryProps,
  ServerHistoryState
> {
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
            {history.length === 0 ? (
              <li>
                <a onClick={this.toggleMenu}>
                  <em>No server history</em>
                </a>
              </li>
            ) : (
              history.map((server, key) => (
                <li key={key}>
                  <a href="#" onClick={this.select(server)}>
                    {server}
                  </a>
                </li>
              ))
            )}
            <li role="separator" className="divider" />
            <li>
              <a href="#" onClick={this.clear}>
                Clear
              </a>
            </li>
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
      enum: ["basicauth", "account", "fxa", "ldap"],
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

const loginPasswordSchema = function(title) {
  return {
    credentials: {
      type: "object",
      title: title,
      required: ["username", "password"],
      properties: {
        username: {
          type: "string",
          title: "Username",
        },
        password: {
          type: "string",
          title: "Password",
        },
      },
    },
  };
};

const loginPasswordUiSchema = {
  credentials: {
    password: { "ui:widget": "password" },
  },
};

const authSchemas = {
  account: {
    schema: {
      ...baseAuthSchema,
      required: [...baseAuthSchema.required, "credentials"],
      properties: {
        ...baseAuthSchema.properties,
        ...loginPasswordSchema("Accounts credentials"),
      },
    },
    uiSchema: {
      ...baseUISchema,
      ...loginPasswordUiSchema,
    },
  },
  basicauth: {
    schema: {
      ...baseAuthSchema,
      required: [...baseAuthSchema.required, "credentials"],
      properties: {
        ...baseAuthSchema.properties,
        ...loginPasswordSchema("BasicAuth credentials"),
      },
    },
    uiSchema: {
      ...baseUISchema,
      ...loginPasswordUiSchema,
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
  account: "Kinto Account Auth",
  fxa: "Firefox Account",
  ldap: "LDAP",
  portier: "Portier",
};

/**
 * Use the server history for the default server field value when available.
 */
function extendSchemaWithHistory(schema, history, authMethods, singleServer) {
  const serverURL = singleServer || history[0] || DEFAULT_KINTO_SERVER;
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

type AuthFormProps = {
  session: SessionState,
  history: string[],
  settings: SettingsState,
  setup: (session: Object) => void,
  serverChange: () => void,
  getServerInfo: (auth: Object) => void,
  navigateToExternalAuth: (authFormData: Object) => void,
  clearHistory: () => void,
};

type AuthFormState = {
  schema: Object,
  uiSchema: Object,
  formData: Object,
};

export default class AuthForm extends PureComponent<
  AuthFormProps,
  AuthFormState
> {
  defaultProps = {
    history: [],
  };

  constructor(props: Object) {
    super(props);
    const { schema, uiSchema } = authSchemas[ANONYMOUS_AUTH];
    this.state = {
      schema,
      uiSchema,
      formData: { authType: ANONYMOUS_AUTH },
    };

    const { history, getServerInfo } = this.props;
    const server = (history && history[0]) || DEFAULT_KINTO_SERVER;

    getServerInfo(anonymousAuthData(server));
  }

  getSupportedAuthMethods = () => {
    const { session: { serverInfo: { capabilities } } } = this.props;
    // Check which of our known auth implementations are supported by the server.
    const supportedAuthMethods = KNOWN_AUTH_METHODS.filter(
      a => a in capabilities
    );
    return [ANONYMOUS_AUTH].concat(supportedAuthMethods);
  };

  onChange = ({ formData }: { formData: Object }) => {
    const { authType, server } = formData;
    if (this.state.formData.server !== server) {
      // Server changed, request its capabilities to check what auth methods it
      // supports.
      const { getServerInfo, serverChange } = this.props;
      serverChange();
      getServerInfo(anonymousAuthData(server));
    }
    const { schema, uiSchema } = authSchemas[authType];
    const specificFormData = [ANONYMOUS_AUTH, "fxa", "portier"].includes(
      authType
    )
      ? omit(formData, ["credentials"])
      : { credentials: {}, ...formData };
    return this.setState({
      schema,
      uiSchema,
      formData: specificFormData,
    });
  };

  debouncedOnChange = debounce(this.onChange, 200);

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
      // case "account":
      default: {
        return setup(extendedFormData);
      }
    }
  };

  render() {
    const { history, clearHistory, settings } = this.props;
    const { schema, uiSchema, formData } = this.state;
    const { singleServer } = settings;
    const authMethods = this.getSupportedAuthMethods();
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
            onChange={this.debouncedOnChange}
            onSubmit={this.onSubmit}>
            <button type="submit" className="btn btn-info">
              {"Sign in using "}
              {authLabels[formData.authType]}
            </button>
          </BaseForm>
        </div>
      </div>
    );
  }
}
