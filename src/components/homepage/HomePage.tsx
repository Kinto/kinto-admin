import Spinner from "../Spinner";
import AuthForm from "./AuthForm";
import HomePageTabs from "./HomePageTabs";
import { notifyError } from "@src/hooks/notifications";
import { setAuth, useAuth, useServerInfo } from "@src/hooks/session";
import type { OpenIDAuth } from "@src/types";
import { isObject } from "@src/utils";
import * as React from "react";
import { useNavigate, useParams } from "react-router";

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
                  <a href={childNode} target="_blank" rel="noreferrer">
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

function SessionInfo() {
  const serverInfo = useServerInfo();
  if (!serverInfo) {
    return <Spinner />;
  }
  return (
    <div>
      <div className="card server-info-panel">
        <div className="card-header">
          <b>Properties</b>
        </div>
        <div className="card-body">
          <ServerProps node={serverInfo} />
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const auth = useAuth();
  const serverInfo = useServerInfo();
  const { payload, token } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if the home page URL contains some payload/token data
    // coming from an *OpenID Connect* redirection.
    if (!payload || !token) {
      return;
    }

    // Check for an incoming authentication.
    try {
      const {
        server,
        authType,
        redirectURL: redirectURLRaw,
      } = JSON.parse(atob(payload));
      const decodedToken = decodeURIComponent(token);

      let authData: OpenIDAuth; // | OtherAuthType;

      if (authType.startsWith("openid-")) {
        const provider = authType.split("-")[1]; // eg. `"openid-auth0"`.
        let parsedToken;
        let expiresAt;
        try {
          // Token is encoded in base64 for a safe path parsing.
          parsedToken = JSON.parse(atob(decodedToken));
        } catch (_e) {
          // Previous version of Kinto exposed the JSON directly in the URL.
          try {
            parsedToken = JSON.parse(decodedToken);
          } catch (_ee) {
            throw new Error(`Token doesn't seems to be a valid JSON: {token}`);
          }
        }

        const tokenType = parsedToken.token_type;
        if (parsedToken.expires_in) {
          expiresAt = new Date().getTime() + parsedToken.expires_in * 1000;
        }

        authData = {
          authType: "openid",
          server,
          provider,
          tokenType,
          credentials: { token: parsedToken.access_token },
          expiresAt,
        };
      } else {
        throw new Error(`Unsupported token authentication "${authType}"`);
      }
      setAuth(authData);
      // Extract hash part of the redirect URL to navigate to.
      const redirectURL = redirectURLRaw.split("#")[1] || "/";
      navigate(redirectURL);
    } catch (error) {
      const message = "Couldn't proceed with authentication.";
      notifyError(message, error);
    }
  }, []);

  if (!auth && !payload && !token) {
    return <AuthForm />;
  }

  if (payload || token) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>{`${serverInfo?.project_name || "Kinto"} Administration`}</h1>
      <HomePageTabs selected="serverinfo">
        <SessionInfo />
      </HomePageTabs>
    </div>
  );
}
