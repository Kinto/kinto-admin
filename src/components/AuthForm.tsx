import BaseForm from "./BaseForm";
import ServerHistory from "./ServerHistory";
import { RJSFSchema } from "@rjsf/utils";
import * as ServersActions from "@src/actions/servers";
import * as SessionActions from "@src/actions/session";
import { ANONYMOUS_AUTH, SINGLE_SERVER } from "@src/constants";
import type { ServerEntry, SessionState } from "@src/types";
import { getAuthLabel, getServerByPriority, omit } from "@src/utils";
import React, { useState } from "react";

const KNOWN_AUTH_METHODS = [
  "basicauth",
  "accounts",
  "fxa",
  "ldap",
  "portier",
  // "openid", // Special cased as we need one auth method per openid provider.
];

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
      oneOf: [
        {
          type: "string",
          const: ANONYMOUS_AUTH,
          title: getAuthLabel(ANONYMOUS_AUTH),
        },
      ],
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
function extendSchemaWithHistory(schema, servers, authMethods): RJSFSchema {
  const serverURL = getServerByPriority(servers);
  return {
    ...schema,
    properties: {
      ...schema.properties,
      authType: {
        ...schema.properties.authType,
        oneOf: authMethods.map(x => {
          return { type: "string", const: x, title: getAuthLabel(x) };
        }),
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

function getSupportedAuthMethods(session: SessionState): string[] {
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

export default function AuthForm({
  session,
  servers = [],
  setupSession,
  serverChange,
  getServerInfo,
  navigateToExternalAuth,
  navigateToOpenID,
  clearServers,
}: AuthFormProps) {
  const authType = (servers.length && servers[0].authType) || ANONYMOUS_AUTH;
  const { schema: currentSchema, uiSchema: curentUiSchema } =
    authSchemas(authType);

  const [schema, setSchema] = useState(currentSchema);
  const [uiSchema, setUiSchema] = useState(curentUiSchema);
  const [formData, setFormData] = useState({
    authType,
    server: getServerByPriority(servers),
  });

  const serverChangeCallback = () => {
    serverChange();
  };

  const serverInfoCallback = async auth => {
    await getServerInfo(auth);
  };

  const authMethods = getSupportedAuthMethods(session);
  const singleAuthMethod = authMethods.length === 1;
  const finalSchema = extendSchemaWithHistory(schema, servers, authMethods);
  const finalUiSchema = extendUiSchemaWithHistory(
    uiSchema,
    servers,
    clearServers,
    serverInfoCallback,
    serverChangeCallback,
    singleAuthMethod
  );

  const onChange = ({ formData: updatedData }: RJSFSchema) => {
    if (formData.server !== updatedData.server) {
      const newServer = servers.find(x => x.server === updatedData.server);
      updatedData.authType = newServer?.authType || ANONYMOUS_AUTH;
    }
    const { authType } = updatedData;
    const { schema, uiSchema } = authSchemas(authType);
    const omitCredentials =
      [ANONYMOUS_AUTH, "fxa", "portier"].includes(authType) ||
      authType.startsWith("openid-");
    const specificFormData = omitCredentials
      ? omit(updatedData, ["credentials"])
      : { credentials: {}, ...updatedData, authType };

    setSchema(schema);
    setUiSchema(uiSchema);
    setFormData(specificFormData);
  };

  const onSubmit = ({ formData }: RJSFSchema) => {
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
      default: {
        return setupSession(extendedFormData);
      }
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <BaseForm
          schema={finalSchema}
          uiSchema={finalUiSchema}
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          showSpinner={session.busy}
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
