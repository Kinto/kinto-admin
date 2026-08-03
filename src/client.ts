import type { AuthData, CredentialsAuth, OpenIDAuth } from "@src/types";
import { KintoClient } from "kinto";
import type { FetchFunction } from "kinto/lib/types";

let client: KintoClient;

// Retry requests for these statuses.
const RETRY_STATUSES = [500, 502, 503, 504];
const RETRY_DELAYS_MS = [100, 250, 500, 1000];
const RETRY_COUNT = RETRY_DELAYS_MS.length;

export const retryingFetch: FetchFunction = async (url, options) => {
  const method = (options?.method || "GET").toUpperCase();
  const isReadRequest = method === "GET" || method === "HEAD";

  for (let attempt = 0; ; attempt++) {
    const isLastAttempt = !isReadRequest || attempt >= RETRY_COUNT;
    try {
      const response = await fetch(url, options);
      if (isLastAttempt || !RETRY_STATUSES.includes(response.status)) {
        return response;
      }
      if (response.headers.get("Retry-After")) {
        // This will be retried using built-in kinto.js retry code.
        return response;
      }
    } catch (err) {
      console.warn(
        `Request ${method} ${url} failed: ${err}. Attempt (${attempt + 1}/${RETRY_COUNT})`
      );
      if (isLastAttempt) {
        throw err;
      }
    }
    // Wait between retries.
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }
};

export function getAuthHeader(auth: AuthData): string | undefined {
  switch (auth.authType) {
    case "openid": {
      const { tokenType, credentials } = auth as OpenIDAuth;
      const { token } = credentials;
      return `${tokenType} ${token}`;
    }
    case "anonymous": {
      return undefined;
    }
    case "ldap":
    case "basicauth":
    case "accounts":
    default: {
      if (!("credentials" in auth)) {
        return undefined;
      }
      const { username, password } = (auth as CredentialsAuth).credentials;
      return "Basic " + btoa([username, password].join(":"));
    }
  }
}

export function setupClient(auth: AuthData): KintoClient {
  const { server } = auth;
  return setClient(
    new KintoClient(server, {
      headers: { Authorization: getAuthHeader(auth) },
      timeout: 30000,
      retry: 1,
      fetchFunc: retryingFetch,
    })
  );
}

export function getClient(): KintoClient {
  if (!client) {
    throw new Error("Client not configured.");
  }
  return client;
}

export function setClient(_client: KintoClient): KintoClient {
  client = _client;
  return client;
}

export function resetClient(): void {
  client = null;
}
