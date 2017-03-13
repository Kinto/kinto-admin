import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-addons-test-utils";

import { createSandbox, createComponent } from "../test_utils";

import App from "../../src/components/App";

describe("App component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Session top bar", () => {
    it("should not render a session top bar when not authenticated", () => {
      const node = createComponent(App, {
        session: { authenticated: false },
        notificationList: [{ message: "blah" }],
        routes: [{ name: "Home" }],
      });

      expect(node.querySelector(".session-info-bar")).to.not.exist;
    });

    it("should render a session top bar when anonymous", () => {
      const session = {
        authenticated: true,
        serverInfo: {
          url: "http://test.server/v1/",
        },
      };
      const node = createComponent(App, {
        session,
        logout: {},
        notificationList: [],
        routes: [{ name: "Home" }],
      });
      const infoBar = node.querySelector(".session-info-bar");
      const content = infoBar.textContent;

      expect(content).to.contain("Anonymous");
      expect(content).to.contain(session.serverInfo.url);
    });

    it("should render a session top bar when authenticated", () => {
      const session = {
        authenticated: true,
        serverInfo: {
          url: "http://test.server/v1/",
          user: {
            id: "fxa:1234",
          },
        },
        credentials: {
          username: "user",
          password: "pass",
        },
      };
      const logout = sandbox.spy();
      const node = createComponent(App, {
        session,
        logout,
        notificationList: [],
        routes: [{ name: "Home" }],
      });

      const infoBar = node.querySelector(".session-info-bar");
      expect(infoBar).to.exist;

      const content = infoBar.textContent;
      expect(content).to.contain(session.serverInfo.url);
      expect(content).to.contain(session.serverInfo.user.id);
      expect(content).to.not.contain(session.credentials.password);

      Simulate.click(node.querySelector(".btn-logout"));

      sinon.assert.called(logout);
    });
  });

  describe("Notifications", () => {
    it("should add a class when notifications are provided", () => {
      const session = { authenticated: false };
      const node = createComponent(App, {
        session,
        notificationList: [{ message: "blah" }],
        routes: [{ name: "Home" }],
      });

      expect(
        node.querySelector(".content").classList.contains("with-notifications")
      ).eql(true);
    });
  });
});
