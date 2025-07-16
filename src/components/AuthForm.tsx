import BaseForm from "./BaseForm";
import ServerHistory from "./ServerHistory";
import { RJSFSchema } from "@rjsf/utils";
import { resetClient, setupClient } from "@src/client";
import {
  ANONYMOUS_AUTH,
  DEFAULT_SERVERINFO,
  SINGLE_SERVER,
} from "@src/constants";
import {
  clearNotifications,
  notifyError,
  notifySuccess,
} from "@src/hooks/notifications";
import { clearServersHistory, useServers } from "@src/hooks/servers";
import { setAuth } from "@src/hooks/session";
import type { ServerInfo } from "@src/types";
import { getAuthLabel, getServerByPriority, omit } from "@src/utils";
import React, { useEffect, useState } from "react";

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
  const customizedSchemas: object = {
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
      "ui:options": {
        servers,
        getServerInfo,
      },
    };
  }
  return {
    ...uiSchema,
    ...authType,
    server: {
      ...uiSchema.server,
      "ui:widget": ServerHistory,
      "ui:options": {
        servers,
        clearServersHistory,
        getServerInfo,
        serverChange,
      },
    },
  };
}

function getSupportedAuthMethods(serverInfo: ServerInfo): string[] {
  if (!serverInfo) return [];
  const { capabilities } = serverInfo;
  const { openid: { providers } = { providers: [] } } = capabilities;
  // Check which of our known auth implementations are supported by the server.
  const supportedAuthMethods = KNOWN_AUTH_METHODS.filter(
    a => a in capabilities
  );
  // Add an auth method for each single openid provider supported by the server.
  const openIdMethods = providers.map(provider => `openid-${provider.name}`);
  return [ANONYMOUS_AUTH].concat(supportedAuthMethods).concat(openIdMethods);
}

function navigateToFxA(server: string, redirect: string) {
  window.location.href = `${server}/fxa-oauth/login?redirect=${encodeURIComponent(
    redirect
  )}`;
}

function postToPortier(server: string, redirect: string) {
  // Alter the AuthForm to make it posting Portier auth information to the
  // dedicated Kinto server endpoint. This is definitely one of the ugliest
  // part of this project, but it works :)
  try {
    const portierUrl = `${server}/portier/login`.replace(
      "//portier",
      "/portier"
    );
    const form = document.querySelector("form.rjsf");
    if (!(form instanceof HTMLFormElement)) {
      notifyError("Missing authentication form.");
      return noop_action;
    }
    form.setAttribute("method", "post");
    form.setAttribute("action", portierUrl);
    const emailInput = form.querySelector("#root_email");
    if (!emailInput) {
      notifyError("Couldn't find email input widget in form.");
      return noop_action;
    }
    emailInput.setAttribute("name", "email");
    const hiddenRedirect = document.createElement("input");
    hiddenRedirect.setAttribute("type", "hidden");
    hiddenRedirect.setAttribute("name", "redirect");
    hiddenRedirect.setAttribute("value", redirect);
    form.appendChild(hiddenRedirect);
    form.submit();
    notifySuccess("Redirecting to auth provider...");
    return noop_action;
  } catch (error) {
    notifyError("Couldn't redirect to authentication endpoint.", error);
    return noop_action;
  }
}

/**
 * Massive side effect: this will navigate away from the current page to perform
 * authentication to a third-party service, like FxA.
 */
function navigateToExternalAuth(authFormData: any) {
  const { origin, pathname } = document.location;
  const { server, authType } = authFormData;

  try {
    const payload = btoa(JSON.stringify(authFormData));
    const redirect = `${origin}${pathname}#/auth/${payload}/`;
    if (authType === "fxa") {
      navigateToFxA(server, redirect);
    } else if (authType === "portier") {
      postToPortier(server, redirect);
    } else {
      notifyError(`Unsupported auth navigation type "${authType}".`);
    }
    notifySuccess("Redirecting to auth provider...");
  } catch (error) {
    notifyError("Couldn't redirect to authentication endpoint.", error);
  }
}

function navigateToOpenID(authFormData: any, provider: any) {
  const { origin, pathname } = document.location;
  const { server } = authFormData;
  const strippedServer = server.replace(/\/$/, "");
  const { auth_path: authPath } = provider;
  const strippedAuthPath = authPath.replace(/^\//, "");
  const payload = btoa(JSON.stringify(authFormData));
  const redirect = encodeURIComponent(`${origin}${pathname}#/auth/${payload}/`);
  window.location.href = `${strippedServer}/${strippedAuthPath}?callback=${redirect}&scope=openid email`;
  notifySuccess("Redirecting to auth provider...");
}

export default function AuthForm() {
  const [showSpinner, setShowSpinner] = useState(false);
  const servers = useServers();
  const [serverInfo, setServerInfo] = useState(DEFAULT_SERVERINFO);
  const authType = (servers.length && servers[0].authType) || ANONYMOUS_AUTH;
  const { schema: currentSchema, uiSchema: curentUiSchema } =
    authSchemas(authType);

  const [schema, setSchema] = useState(currentSchema);
  const [uiSchema, setUiSchema] = useState(curentUiSchema);
  const [formData, setFormData] = useState({
    authType,
    server: getServerByPriority(servers),
  });

  const serverChangeCallback = async () => {
    setShowSpinner(true);
    setServerInfo(DEFAULT_SERVERINFO);
  };

  const serverInfoCallback = async auth => {
    try {
      setShowSpinner(true);

      const newInfo = await setupClient(auth).fetchServerInfo();
      setServerInfo(newInfo);
      setFormData({
        server: auth.server,
        authType:
          servers.find(x => x.server === auth.server)?.authType ||
          ANONYMOUS_AUTH,
      });

      const { schema, uiSchema } = authSchemas(authType);
      setSchema(schema);
      setUiSchema(uiSchema);

      const { project_name: rawProjectName } = serverInfo;
      const projectName = rawProjectName == "kinto" ? "Kinto" : rawProjectName;
      document.title = projectName + " Administration";

      clearNotifications();
    } catch (ex) {
      notifyError("Unable to retrieve server information", ex);
    }
    resetClient();
    setShowSpinner(false);
  };

  useEffect(() => {
    // load last used server by default
    if (SINGLE_SERVER || (servers && servers.length)) {
      serverInfoCallback({
        authType: ANONYMOUS_AUTH,
        server: SINGLE_SERVER || servers[0].server,
      });
    }
  }, []);

  const authMethods = getSupportedAuthMethods(serverInfo);
  const singleAuthMethod = authMethods.length === 1;
  const finalSchema = extendSchemaWithHistory(schema, servers, authMethods);
  const finalUiSchema = extendUiSchemaWithHistory(
    uiSchema,
    servers,
    serverInfoCallback,
    serverChangeCallback,
    singleAuthMethod
  );

  const onChange = props => {
    const updatedData = props.formData;
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

  const onSubmit = async ({ formData }: RJSFSchema) => {
    let { authType } = formData;
    let openidProvider = null;
    if (authType.startsWith("openid-")) {
      openidProvider = authType.replace("openid-", "");
      authType = "openid";
    }

    const extendedFormData = {
      ...formData,
      redirectURL: `${location.pathname || "/"}${location.hash || ""}`,
    };
    switch (authType) {
      case "fxa":
      case "portier": {
        return navigateToExternalAuth(extendedFormData);
      }
      case "openid": {
        const {
          capabilities: { openid: { providers } = { providers: [] } },
        } = serverInfo;
        const providerData = providers.find(p => p.name === openidProvider);
        if (!providerData) {
          throw new Error("Couldn't find provider data in the state. Bad.");
        }
        return navigateToOpenID(extendedFormData, providerData);
      }
      case "anonymous": {
        setAuth(extendedFormData);
        break;
      }
      default: {
        try {
          setShowSpinner(true);
          const serverInfoWithAuth =
            await setupClient(extendedFormData).fetchServerInfo();
          if (!serverInfoWithAuth.user) {
            notifyError("Authentication failed.", {
              message: `Could not authenticate with ${getAuthLabel(authType)}`,
            });
            setShowSpinner(false);
            return;
          }
          setAuth(extendedFormData);
        } catch (ex) {
          notifyError("Couldn't complete login.", ex);
          setShowSpinner(false);
        }
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
          showSpinner={showSpinner}
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
