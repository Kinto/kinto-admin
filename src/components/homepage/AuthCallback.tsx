import Spinner from "@src/components/Spinner";
import { notifyError } from "@src/hooks/notifications";
import { setAuth } from "@src/hooks/session";
import type { OpenIDAuth } from "@src/types";
import * as React from "react";
import { useNavigate, useParams } from "react-router";

function safeParseJSON(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function parseBase64JSON(b64: string) {
  try {
    // url-safe → standard
    let s = b64.replace(/-/g, "+").replace(/_/g, "/");
    // pad
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    return JSON.parse(atob(s));
  } catch {
    return undefined;
  }
}

export default function AuthCallback() {
  const { payload, token } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      try {
        if (!payload || !token) {
          throw new Error("Missing payload or token.");
        }

        const decoded = parseBase64JSON(payload);
        if (!decoded) throw new Error("Invalid payload.");

        const {
          server,
          authType,
          redirectURL: redirectURLRaw,
        }: { server: string; authType: string; redirectURL?: string } = decoded;

        if (!authType?.startsWith("openid-")) {
          throw new Error(`Unsupported token authentication "${authType}"`);
        }

        const provider = authType.split("-")[1];

        // token can be URI-encoded and either base64-json or plain json
        const decodedToken = decodeURIComponent(token);
        const parsedToken =
          parseBase64JSON(decodedToken) ?? safeParseJSON(decodedToken);
        if (!parsedToken) throw new Error("Token must be valid JSON.");

        const tokenType = parsedToken.token_type as string | undefined;
        const expiresAt = parsedToken.expires_in
          ? Date.now() + parsedToken.expires_in * 1000
          : undefined;

        const authData: OpenIDAuth = {
          authType: "openid",
          server,
          provider,
          tokenType,
          credentials: { token: parsedToken.access_token },
          expiresAt,
        };

        setAuth(authData);

        // Navigate to hash of redirectURL if present, else home
        const redirectURL = redirectURLRaw?.split("#")[1] ?? "/";
        navigate(redirectURL, { replace: true });
      } catch (error) {
        notifyError("Couldn't proceed with authentication.", error);
        navigate("/", { replace: true });
      }
    })();
  }, [payload, token, navigate]);

  return <Spinner />;
}
