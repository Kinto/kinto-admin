import { expect } from "chai";

import session from "../../src/slices/session";
import { sessionActions } from "../../src/slices/session";

describe("session reducer", () => {
  const auth = {
    server: "http://test",
    authType: "basicauth",
    credentials: {
      username: "user",
      password: "pass",
    },
  };

  it("sessionBusy", () => {
    expect(session(undefined, sessionActions.sessionBusy(true)))
      .to.have.property("busy")
      .eql(true);
  });

  it("setupSession", () => {
    expect(session(undefined, sessionActions.setupSession(auth)))
      .to.have.property("authenticating")
      .eql(true);
  });

  it("setupComplete", () => {
    expect(session(undefined, sessionActions.setupComplete(auth))).eql({
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

  it("serverInfoSuccess", () => {
    const serverInfo = {
      project_name: "Remote Settings",
      capabilities: {
        attachments: {},
      },
      user: {
        bucket: "foo",
      },
    };

    const state = session(
      undefined,
      sessionActions.serverInfoSuccess(serverInfo)
    );

    expect(state).to.have.property("serverInfo").eql(serverInfo);
  });

  it("permissionsListSuccess", () => {
    const permissions = [
      {
        uri: "/some/object",
      },
    ];

    const state = session(
      undefined,
      sessionActions.permissionsListSuccess(permissions)
    );

    expect(state).to.have.property("permissions").eql(permissions);
  });

  it("listBuckets", () => {
    const state = session(undefined, sessionActions.listBuckets());

    expect(state).to.have.property("busy").eql(true);
  });

  it("bucketsSuccess", () => {
    const buckets = [];

    const state = session(undefined, sessionActions.bucketsSuccess(buckets));
    expect(state).to.have.property("buckets").eql(buckets);
    expect(state).to.have.property("busy").eql(false);
  });

  it("setAuthenticated", () => {
    const state = session(
      { authenticated: false },
      sessionActions.setAuthenticated()
    );
    expect(state).to.have.property("authenticated").eql(true);
  });

  it("logout", () => {
    const oldServerInfo = {
      url: "example.com",
    };
    const oldState = { authenticated: true, serverInfo: oldServerInfo };
    const newState = session(oldState, sessionActions.logout());
    expect(newState).to.have.property("authenticated").eql(false);
    expect(newState.serverInfo).to.have.property("url").eql("example.com");
  });
});
