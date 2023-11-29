import session from "../../src/reducers/session";
import {
  SESSION_BUSY,
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_PERMISSIONS_SUCCESS,
  SESSION_AUTHENTICATED,
  SESSION_BUCKETS_REQUEST,
  SESSION_BUCKETS_SUCCESS,
  SESSION_LOGOUT,
} from "../../src/constants";

describe("session reducer", () => {
  const auth = {
    server: "http://test",
    authType: "basicauth",
    credentials: {
      username: "user",
      password: "pass",
    },
  };

  it("SESSION_BUSY", () => {
    expect(
      session(undefined, {
        type: SESSION_BUSY,
        busy: true,
      })
    ).toHaveProperty("busy", true);
  });

  it("SESSION_SETUP", () => {
    expect(
      session(undefined, {
        type: SESSION_SETUP,
        auth,
      })
    ).toHaveProperty("authenticating", true);
  });

  it("SESSION_SETUP_COMPLETE", () => {
    expect(
      session(undefined, {
        type: SESSION_SETUP_COMPLETE,
        auth,
      })
    ).toStrictEqual({
      busy: false,
      authenticating: false,
      authenticated: false,
      auth,
      buckets: [],
      permissions: null,
      redirectURL: null,
      serverInfo: {
        url: "",
        project_name: "Kinto",
        project_docs: "",
        capabilities: {},
      },
    });
  });

  it("SESSION_SERVERINFO_SUCCESS", () => {
    const serverInfo = {
      project_name: "Remote Settings",
      capabilities: {
        attachments: {},
      },
      user: {
        bucket: "foo",
      },
    };

    const state = session(undefined, {
      type: SESSION_SERVERINFO_SUCCESS,
      serverInfo,
    });

    expect(state).toHaveProperty("serverInfo", serverInfo);
  });

  it("SESSION_PERMISSIONS_SUCCESS", () => {
    const permissions = [
      {
        uri: "/some/object",
      },
    ];

    const state = session(undefined, {
      type: SESSION_PERMISSIONS_SUCCESS,
      permissions,
    });

    expect(state).toHaveProperty("permissions", permissions);
  });

  it("SESSION_BUCKETS_REQUEST", () => {
    const state = session(undefined, {
      type: SESSION_BUCKETS_REQUEST,
    });

    expect(state).toHaveProperty("busy", true);
  });

  it("SESSION_BUCKETS_SUCCESS", () => {
    const buckets = [];

    const state = session(undefined, {
      type: SESSION_BUCKETS_SUCCESS,
      buckets,
    });

    expect(state).toHaveProperty("buckets", buckets);
    expect(state).toHaveProperty("busy", false);
  });

  it("SESSION_AUTHENTICATED", () => {
    const state = session(
      { authenticated: false },
      {
        type: SESSION_AUTHENTICATED,
      }
    );

    expect(state).toHaveProperty("authenticated", true);
  });

  it("SESSION_LOGOUT", () => {
    const state = { authenticated: true };

    expect(
      session(state, {
        type: SESSION_LOGOUT,
      })
    ).toHaveProperty("authenticated", false);
  });
});
