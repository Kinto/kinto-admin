import React from "react";
import { expect } from "chai";
import sinon from "sinon";

import configureStore, { hashHistory } from "../../src/store/configureStore";
import { createSandbox } from "../test_utils";
import { mount } from "enzyme";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";

import App from "../../src/containers/App";
import Sidebar from "../../src/containers/Sidebar";
import Notifications from "../../src/containers/Notifications";
import CollectionRecordsPage from "../../src/containers/collection/CollectionRecordsPage";
import * as notificationActions from "../../src/actions/notifications";
import * as sessionActions from "../../src/actions/session";

describe("App component", () => {
  let app, sandbox, store;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.spy(sessionActions, "logout");
    store = configureStore();
    app = mount(
      <Provider store={store}>
        <ConnectedRouter history={hashHistory}>
          <App
            sidebar={Sidebar}
            notifications={Notifications}
            collectionRecordsPage={CollectionRecordsPage}
          />
        </ConnectedRouter>
      </Provider>
    );
  });

  afterEach(() => {
    sessionActions.logout.restore();
    sandbox.restore();
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

      sinon.assert.called(sessionActions.logout);
    });
  });

  describe("Notifications", () => {
    it("should add a class when notifications are provided", () => {
      ({ notificationList: [{ message: "blah" }] });
      store.dispatch(notificationActions.notifySuccess("blah"));
      app.update();

      expect(app.find(".with-notifications").length).to.equal(1);
    });
  });
});
