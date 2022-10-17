import type { SessionState, ServerEntry } from "../types";

import React, { PureComponent } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import * as ServersActions from "../actions/servers";
import * as SessionActions from "../actions/session";
import BaseForm from "./BaseForm";
import {
  debounce,
  getAuthLabel,
  getServerByPriority,
  isObjectEmpty,
  omit,
} from "../utils";
import { ANONYMOUS_AUTH, SINGLE_SERVER } from "../constants";

const anonymousAuthData = server => ({
  authType: ANONYMOUS_AUTH,
  server: server,
});
const KNOWN_AUTH_METHODS = [
  "basicauth",
  "accounts",
  "fxa",
  "ldap",
  "portier",
  // "openid", // Special cased as we need one auth method per openid provider.
];

type ServerHistoryProps = {
  id: string;
  value: string;
  placeholder: string;
  options: any;
  onChange: (s: string) => void;
};

type ServerHistoryState = {};

class ServerHistory extends PureComponent<
  ServerHistoryProps,
  ServerHistoryState
> {
  constructor(props) {
    super(props);
  }

  select = server => {
    return event => {
      event.preventDefault();
      this.props.onChange(server);
      this.debouncedFetchServerInfo(server);
    };
  };

  clear = event => {
    event.preventDefault();
    const { clearServers } = this.props.options;
    clearServers();
  };

  onServerChange = event => {
    const server = event.target.value;
    this.props.onChange(server);
    // Do not try to fetch server infos if the field value is invalid.
    if (server && event.target.validity && event.target.validity.valid) {
      this.debouncedFetchServerInfo(server);
    }
  };

  fetchServerInfo = server => {
    // Server changed, request its capabilities to check what auth methods it
    // supports.
    const { getServerInfo, serverChange } = this.props.options;
    serverChange();
    getServerInfo(anonymousAuthData(server));
  };

  debouncedFetchServerInfo = debounce(this.fetchServerInfo, 500);

  render() {
    const { id, value, placeholder, options } = this.props;
    const { servers, pattern } = options;
    return (
      <InputGroup>
        <FormControl
          type="text"
          id={id}
          placeholder={placeholder}
          pattern={pattern}
          value={value}
          onChange={this.onServerChange}
        />
        <DropdownButton
          as={InputGroup.Append}
          variant="outline-secondary"
          title="Servers"
        >
          {servers.length === 0 ? (
            <Dropdown.Item>
              <em>No server history</em>
            </Dropdown.Item>
          ) : (
            servers.map(({ server }, key) => (
              <Dropdown.Item key={key}>
                <a href="#" onClick={this.select(server)}>
                  {server}
                </a>
              </Dropdown.Item>
            ))
          )}
          <Dropdown.Divider />
          <Dropdown.Item href="#" onClick={this.clear}>
            Clear
          </Dropdown.Item>
        </DropdownButton>
      </InputGroup>
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
      enum: [ANONYMOUS_AUTH],
    },
  },
};

const baseUISchema = {
  server: {
    "ui:placeholder": "https://server.com/v1",
    "ui:pattern": "^https?://.+/v\\d+/?",
  },
  authType: {
    "ui:widget": "radio",
  },
};

const loginPasswordSchema = function (title) {
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

const authSchemas = authType => {
  const customizedSchemas: Object = {
    accounts: {
      schema: {
        ...baseAuthSchema,
        required: [...baseAuthSchema.required, "credentials"],
        properties: {
          ...baseAuthSchema.properties,
          ...loginPasswordSchema("Account credentials"),
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
    fxa: {
      schema: {
        ...baseAuthSchema,
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
        ...baseUISchema,
      },
    },
  };
  if (authType in customizedSchemas) {
    return customizedSchemas[authType];
  }

  // Return the standard schemas if no customization is needed (eg for
  // anonymous, openid).
  return {
    schema: {
      ...baseAuthSchema,
    },
    uiSchema: {
      ...baseUISchema,
    },
  };
};

/**
 * Use the servers history for the default server field value when available.
 */
function extendSchemaWithHistory(schema, servers, authMethods) {
  const serverURL = getServerByPriority(servers);
  return {
    ...schema,
    properties: {
      ...schema.properties,
      authType: {
        ...schema.properties.authType,
        enum: authMethods,
        enumNames: authMethods.map(getAuthLabel),
      },
      server: {
        ...schema.properties.server,
        default: serverURL,
      },
    },
  };
}

/**
 * Use the servers history for the default server field value when available.
 */
function extendUiSchemaWithHistory(
  uiSchema,
  servers,
  clearServers,
  getServerInfo,
  serverChange,
  singleAuthMethod
) {
  const authType = {
    authType: {
      ...uiSchema.authType,
      "ui:widget": singleAuthMethod ? "hidden" : "radio",
    },
  };

  if (SINGLE_SERVER) {
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
      "ui:options": { servers, clearServers, getServerInfo, serverChange },
    },
  };
}

type AuthFormProps = {
  session: SessionState;
  servers: ServerEntry[];
  setupSession: typeof SessionActions.setupSession;
  serverChange: typeof SessionActions.serverChange;
  getServerInfo: typeof SessionActions.getServerInfo;
  navigateToExternalAuth: typeof SessionActions.navigateToExternalAuth;
  navigateToOpenID: typeof SessionActions.navigateToOpenID;
  clearServers: typeof ServersActions.clearServers;
};

type AuthFormState = {
  schema: any;
  uiSchema: any;
  formData: any;
};

export default class AuthForm extends PureComponent<
  AuthFormProps,
  AuthFormState
> {
  static defaultProps = {
    servers: [],
  };

  constructor(props: AuthFormProps) {
    super(props);
    const { servers } = this.props;

    const server = getServerByPriority(servers);
    const authType = (servers.length && servers[0].authType) || ANONYMOUS_AUTH;
    const { schema, uiSchema } = authSchemas(authType);
    this.state = {
      schema,
      uiSchema,
      formData: { authType, server },
    };
  }

  getSupportedAuthMethods = (): string[] => {
    const { session } = this.props;
    const {
      serverInfo: { capabilities },
    } = session;
    const { openid: { providers } = { providers: [] } } = capabilities;
    // Check which of our known auth implementations are supported by the server.
    const supportedAuthMethods = KNOWN_AUTH_METHODS.filter(
      a => a in capabilities
    );
    // Add an auth method for each single openid provider supported by the server.
    const openIdMethods = providers.map(provider => `openid-${provider.name}`);
    return [ANONYMOUS_AUTH].concat(supportedAuthMethods).concat(openIdMethods);
  };

  onChange = ({ formData }: { formData: any }) => {
    const { authType } = formData;
    const { uiSchema } = authSchemas(authType);
    const { schema } = authSchemas(authType);
    const omitCredentials =
      authType in [ANONYMOUS_AUTH, "fxa", "portier"] ||
      authType.startsWith("openid-");
    const specificFormData = omitCredentials
      ? omit(formData, ["credentials"])
      : { credentials: {}, ...formData };
    return this.setState({
      schema,
      uiSchema,
      formData: specificFormData,
    });
  };

  onSubmit = ({ formData }: { formData: any }) => {
    const { session, setupSession, navigateToExternalAuth, navigateToOpenID } =
      this.props;
    let { authType } = formData;
    let openidProvider = null;
    if (authType.startsWith("openid-")) {
      openidProvider = authType.replace("openid-", "");
      authType = "openid";
    }

    const { redirectURL } = session;
    const extendedFormData = { ...formData, redirectURL };
    switch (authType) {
      case "fxa":
      case "portier": {
        return navigateToExternalAuth(extendedFormData);
      }
      case "openid": {
        const { session } = this.props;
        const {
          serverInfo: {
            capabilities: { openid: { providers } = { providers: [] } },
          },
        } = session;
        const providerData = providers.find(p => p.name === openidProvider);
        if (!providerData) {
          throw new Error("Couldn't find provider data in the state. Bad.");
        }
        return navigateToOpenID(extendedFormData, providerData);
      }
      // case "anonymous":
      // case "ldap":
      // case "basicauth":
      // case "accounts":
      default: {
        return setupSession(extendedFormData);
      }
    }
  };

  componentDidUpdate(prevProps: AuthFormProps, prevState: AuthFormState) {
    const {
      formData: { server: prevServer },
    } = prevState;
    const {
      formData: { server: newServer },
    } = this.state;

    if (prevServer !== newServer) {
      // Server changed, set the authType back to "anonymous", until we get the
      // `capabilities` back from the call to `getServerInfo`. This is what
      // we're doing below.
      return this.onChange({
        ...this.state,
        formData: { ...this.state.formData, authType: ANONYMOUS_AUTH },
      });
    }

    const {
      session: {
        serverInfo: { capabilities: prevCapabilities },
      },
    } = prevProps;
    const {
      session: {
        serverInfo: { capabilities: newCapabilities },
      },
    } = this.props;
    if (isObjectEmpty(prevCapabilities) && !isObjectEmpty(newCapabilities)) {
      // The `capabilities` (and thus the auth methods) have changed following
      // a successful `getServerInfo`, update the default auth method with the
      // one from the servers, if we have one for this server.
      const serverHistoryEntry = this.props.servers.find(
        ({ server }) => server === newServer
      );
      if (serverHistoryEntry) {
        return this.onChange({
          ...this.state,
          formData: {
            ...this.state.formData,
            authType: serverHistoryEntry.authType,
          },
        });
      }
    }
  }

  render() {
    const { servers, clearServers, getServerInfo, serverChange } = this.props;
    const { schema, uiSchema, formData } = this.state;
    const authMethods = this.getSupportedAuthMethods();
    const singleAuthMethod = authMethods.length === 1;
    const finalSchema = extendSchemaWithHistory(schema, servers, authMethods);
    const finalUiSchema = extendUiSchemaWithHistory(
      uiSchema,
      servers,
      clearServers,
      getServerInfo,
      serverChange,
      singleAuthMethod
    );
    return (
      <div className="card">
        <div className="card-body">
          <BaseForm
            schema={finalSchema}
            uiSchema={finalUiSchema}
            formData={formData}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
          >
            <button type="submit" className="btn btn-info">
              {"Sign in using "}
              {getAuthLabel(formData.authType)}
            </button>
          </BaseForm>
        </div>
      </div>
    );
  }
}
