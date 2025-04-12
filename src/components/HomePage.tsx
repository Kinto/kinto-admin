import AuthForm from "./AuthForm";
import Spinner from "./Spinner";
import * as SessionActions from "@src/actions/session";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { notifyError } from "@src/hooks/notifications";
import { useServers } from "@src/hooks/servers";
import { loadSession } from "@src/store/localStore";
import type { OpenIDAuth, PortierAuth, TokenAuth } from "@src/types";
import { getServerByPriority, isObject } from "@src/utils";
import * as React from "react";
import { useParams } from "react-router";

function ServerProps({ node }: { node: any }) {
  const nodes = Array.isArray(node)
    ? node.map((n, i) => [i, n])
    : Object.keys(node).map(key => [key, node[key]]);
  return (
    <table className="table table-condensed">
      <tbody>
        {nodes.map(([key, childNode], i) => {
          return (
            <tr key={i}>
              <th data-testid="home-th">{key}</th>
              <td style={{ width: "100%" }}>
                {isObject(childNode) || Array.isArray(childNode) ? (
                  <ServerProps node={childNode} />
                ) : typeof childNode === "string" &&
                  childNode.startsWith("http") ? (
                  <a href={childNode} target="_blank">
                    {childNode}
                  </a>
                ) : (
                  String(childNode)
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SessionInfo({ session: { serverInfo } }) {
  return (
    <div>
      <div className="card server-info-panel">
        <div className="card-header">
          <b>Server information</b>
        </div>
        <div className="card-body">
          <ServerProps node={serverInfo} />
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.session);
  const servers = useServers();
  const { authenticated, authenticating, serverInfo } = session;
  const { project_name } = serverInfo;
  const params = useParams<{ payload?: string; token?: string }>();

  React.useEffect(() => {
    const session = loadSession();

    if (
      session &&
      session.auth &&
      !(new Date().getTime() >= session.auth.expiresAt)
    ) {
      dispatch(SessionActions.setupSession(session.auth));
    } else {
      dispatch(
        SessionActions.getServerInfo({
          authType: "anonymous",
          server: getServerByPriority(servers),
        })
      );
    }
    // dependency array left empty so this behaves like `componentDidMount`
  }, []);

  React.useEffect(() => {
    // Check if the home page URL contains some payload/token data
    // coming from an *OpenID Connect* redirection.
    const { payload } = params;
    let { token } = params;

    if (!payload || !token) {
      // No auth token found in URL.
      return;
    }
    // Check for an incoming authentication.
    try {
      let { server, authType } = JSON.parse(atob(payload));
      token = decodeURIComponent(token);

      let authData: OpenIDAuth | TokenAuth | PortierAuth;

      if (authType.startsWith("openid-")) {
        const provider = authType.split("-")[1]; // eg. `"openid-auth0"`.
        authType = "openid";
        let tokenType;
        let parsedToken;
        let expiresAt;
        try {
          // Token is encoded in base64 for a safe path parsing.
          parsedToken = JSON.parse(atob(token));
        } catch (_e) {
          // Previous version of Kinto exposed the JSON directly in the URL.
          try {
            parsedToken = JSON.parse(token);
          } catch (_ee) {
            throw new Error(`Token doesn't seems to be a valid JSON: {token}`);
          }
        }

        token = parsedToken.access_token;
        tokenType = parsedToken.token_type;
        if (parsedToken.expires_in) {
          expiresAt = new Date().getTime() + parsedToken.expires_in * 1000;
        }

        authData = {
          authType,
          server,
          provider,
          tokenType,
          credentials: { token },
          expiresAt,
        };
      } else if (authType == "fxa") {
        authData = {
          authType: "fxa",
          server,
          credentials: { token },
        };
      } else if (authType == "portier") {
        authData = {
          authType: "portier",
          server,
          credentials: { token },
        };
      } else {
        throw new Error(`Unsupported token authentication "${authType}"`);
      }
      // This action is bound with the setupSession() saga, which will
      // eventually lead to a call to setupClient() that globally sets
      // the headers of the API client.
      dispatch(SessionActions.setupSession(authData));
    } catch (error) {
      const message = "Couldn't proceed with authentication.";
      notifyError(message, error);
    }
    // dependency array left empty so this behaves like `componentDidMount`
  }, []);

  return (
    <div>
      <h1>{`${project_name} Administration`}</h1>
      {authenticating ? (
        <Spinner />
      ) : authenticated ? (
        <SessionInfo session={session} />
      ) : (
        <AuthForm
          setupSession={auth => dispatch(SessionActions.setupSession(auth))}
          serverChange={() => dispatch(SessionActions.serverChange())}
          getServerInfo={auth => dispatch(SessionActions.getServerInfo(auth))}
          session={session}
          servers={servers}
          navigateToExternalAuth={authFormData =>
            dispatch(SessionActions.navigateToExternalAuth(authFormData))
          }
          navigateToOpenID={(authFormData, provider) =>
            dispatch(SessionActions.navigateToOpenID(authFormData, provider))
          }
        />
      )}
    </div>
  );
}
