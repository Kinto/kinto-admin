import React from "react";
import { expect } from "chai";
import { takeEvery } from "redux-saga";

import {
  flattenPluginsRoutes,
  flattenPluginsSagas,
  flattenPluginsReducers,
} from "../src/plugin";

describe("Plugin API", () => {
  describe("flattenPluginsRoutes()", () => {
    const fakeContent = <div className="content" />;
    const fakeSidebar = <div className="sidebar" />;
    const plugins = [
      {
        routes: [
          { path: "/route/1", components: { content: fakeContent } },
          { path: "/route/2" },
        ],
      },
      {
        routes: [{ path: "/route/3" }],
      },
    ];

    it("should flatten plugins routes", () => {
      expect(flattenPluginsRoutes(plugins)).to.have.length.of(3);
    });

    it("should map to Route components", () => {
      expect(flattenPluginsRoutes(plugins)[0]).to.have
        .property("type")
        .to.have.property("displayName")
        .eql("Route");
    });

    it("should forward the path prop", () => {
      expect(flattenPluginsRoutes(plugins)[0])
        .property("props")
        .property("path")
        .eql("/route/1");
    });

    it("should merge plugin route components with default ones", () => {
      const routes = flattenPluginsRoutes(plugins, { sidebar: fakeSidebar });
      expect(routes[0])
        .property("props")
        .property("components")
        .property("content")
        .eql(fakeContent);
      expect(routes[0])
        .property("props")
        .property("components")
        .property("sidebar")
        .eql(fakeSidebar);
    });
  });

  describe("flattenPluginsSagas()", () => {
    function getState() {}
    function* saga1() {
      yield 1;
    }
    function* saga2() {
      yield 2;
    }
    function* saga3() {
      yield 3;
    }
    const plugins = [
      [[takeEvery, "ACTION_1", saga1], [takeEvery, "ACTION_2", saga2]],
      [[takeEvery, "ACTION_3", saga3]],
    ];

    it("should append the plugins sagas to the standard watchers", () => {
      const sagas = flattenPluginsSagas(plugins, getState);

      expect(sagas).to.have.length.of(3);
      expect(sagas[0].name).eql("takeEvery(ACTION_1, saga1)");
      expect(sagas[1].name).eql("takeEvery(ACTION_2, saga2)");
      expect(sagas[2].name).eql("takeEvery(ACTION_3, saga3)");
    });
  });

  describe("flattenPluginsReducers()", () => {
    const plugins = [
      {
        foo() {},
        bar() {},
      },
      {
        baz() {},
      },
    ];

    it("should flatten reducers", () => {
      expect(flattenPluginsReducers(plugins, {})).to.have.keys(
        "foo",
        "bar",
        "baz"
      );
    });

    it("should extend standard reducers", () => {
      // Note: actual reducer extensibility is tested in configureStore_test.js
      const foo = () => {};
      expect(flattenPluginsReducers(plugins, { foo })).to.have.keys(
        "foo",
        "bar",
        "baz"
      );
    });
  });
});
