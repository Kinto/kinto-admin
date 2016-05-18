import { expect } from "chai";

import session from "../../scripts/reducers/session";
import {
  CLIENT_BUSY,
  SESSION_SETUP_COMPLETE,
  SESSION_SERVER_INFO_LOADED,
  SESSION_BUCKETS_LIST_LOADED,
  SESSION_LOGOUT,
} from "../../scripts/constants";


describe("session reducer", () => {
  it("CLIENT_BUSY", () => {
    expect(session(undefined, {
      type: CLIENT_BUSY,
      busy: true,
    })).to.have.property("busy").eql(true);
  });

  it("SESSION_SETUP_COMPLETE", () => {
    const setup = {
      server: "http://test",
      username: "user",
      password: "pass"
    };

    expect(session(undefined, {
      type: SESSION_SETUP_COMPLETE,
      session: setup
    })).eql({
      ...setup,
      authenticated: false,
      busy: false,
      buckets: [],
      serverInfo: {},
    });
  });

  it("SESSION_SERVER_INFO_LOADED", () => {
    const serverInfo = {
      user: {
        bucket: "foo"
      }
    };

    const state = session(undefined, {
      type: SESSION_SERVER_INFO_LOADED,
      serverInfo
    });

    expect(state).to.have.property("serverInfo").eql(serverInfo);
    expect(state).to.have.property("authenticated").eql(true);
  });

  it("SESSION_BUCKETS_LIST_LOADED", () => {
    const buckets = [];

    expect(session(undefined, {
      type: SESSION_BUCKETS_LIST_LOADED,
      buckets
    })).to.have.property("buckets").eql(buckets);
  });

  it("SESSION_LOGOUT", () => {
    const state = {authenticated: true};

    expect(session(state, {
      type: SESSION_LOGOUT,
    })).to.have.property("authenticated").eql(false);
  });

});
