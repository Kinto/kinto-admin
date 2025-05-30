import {
  SESSION_AUTHENTICATED,
  SESSION_BUSY,
  SESSION_LOGOUT,
  SESSION_PERMISSIONS_SUCCESS,
  SESSION_SERVERINFO_SUCCESS,
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
} from "@src/constants";
import session from "@src/reducers/session";

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
