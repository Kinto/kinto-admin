import React from "react";
import { expect } from "chai";
import sinon from "sinon";

import { configureAppStore } from "../../src/store/configureStore";
import { createSandbox } from "../test_utils";
import { mount } from "enzyme";
import { Router } from "react-router";
import { Provider } from "react-redux";

import { Layout } from "../../src/components/Layout";
import * as sessionActions from "../../src/actions/session";

describe("App component", () => {
  let app, clock, sandbox, store, history;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.spy(sessionActions, "logout");
    ({ store, history } = configureAppStore());
    clock = sinon.useFakeTimers();
    app = mount(
      <Provider store={store}>
        <Router history={history}>
          <Layout />
        </Router>
      </Provider>
    );
  });

  afterEach(() => {
    sessionActions.logout.restore();
    sandbox.restore();
    clock.restore();
  });

  describe("Session top bar", () => {
    it("should not render a session top bar when not authenticated", () => {
      expect(app.find(".session-info-bar")).to.have.a.lengthOf(0);
    });

    it("should render a session top bar when anonymous", () => {
      const serverInfo = {
        url: "http://test.server/v1/",
        capabilities: {},
      };
      store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
      store.dispatch(sessionActions.setAuthenticated());
      const content = app.text();

      expect(content).to.contain("Anonymous");
      expect(content).to.contain(serverInfo.url);
    });

    it("should display a link to the server docs", () => {
      const serverInfo = {
        url: "http://test.server/v1/",
        project_docs: "https://remote-settings.readthedocs.io/",
        capabilities: {},
      };
      store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
      store.dispatch(
        sessionActions.setAuthenticated({ user: { id: "fxa:abc" } })
      );

      app.update();
      const infoBar = app.find(".session-info-bar a.project-docs").getDOMNode();
      expect(infoBar.href).to.eql(serverInfo.project_docs);
    });

    it("should render a session top bar when authenticated", () => {
      const serverInfo = {
        url: "http://test.server/v1/",
        capabilities: {},
        user: {
          id: "fxa:1234",
        },
      };
      const credentials = {
        username: "user",
        password: "pass",
      };
      store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
      store.dispatch(sessionActions.setupComplete());
      store.dispatch(sessionActions.setAuthenticated(credentials));

      app.update();
      const infoBar = app.find(".session-info-bar");
      expect(infoBar.length).to.equal(1);

      const content = infoBar.text();
      expect(content).to.contain(serverInfo.url);
      expect(content).to.contain(serverInfo.user.id);
      expect(content).to.not.contain(credentials.password);

      app.find(".btn-logout").simulate("click");
      clock.tick();
      sinon.assert.called(sessionActions.logout);
    });
  });
});
