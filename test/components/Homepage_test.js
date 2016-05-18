import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-addons-test-utils";

import { createSandbox, createComponent } from "../test_utils";
import HomePage from "../../scripts/components/HomePage";


describe("HomePage component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Not authenticated", () => {
    let node, setup;

    beforeEach(() => {
      setup = sandbox.spy();
      node = createComponent(HomePage, {
        setup,
        session: {authenticated: false},
      });
    });

    it("should render a setup form", () => {
      expect(node.querySelector("form")).to.exist;
    });

    it("should submit setup data", () => {
      Simulate.change(node.querySelector("#root_server"), {
        target: {value: "http://test.server/v1"}
      });
      Simulate.change(node.querySelector("#root_username"), {
        target: {value: "user"}
      });
      Simulate.change(node.querySelector("#root_password"), {
        target: {value: "pass"}
      });

      Simulate.submit(node.querySelector("form"));

      sinon.assert.calledWithExactly(setup, {
        server: "http://test.server/v1",
        username: "user",
        password: "pass",
      });
    });
  });

  describe("Authenticated", () => {
    let node;

    beforeEach(() => {
      node = createComponent(HomePage, {
        session: {
          authenticated: true,
          server: "http://test.server/v1",
          username: "user",
          password: "pass",
          serverInfo: {
            foo: {
              bar: "plop"
            }
          }
        },
      });
    });

    it("should render server information heading", () => {
      expect(node.querySelector(".panel-heading").textContent)
        .eql("Server information");
    });

    it("should render server information table", () => {
      expect([].map.call(node.querySelectorAll("th"), x => x.textContent))
        .eql(["foo", "bar"]);
    });
  });
});
