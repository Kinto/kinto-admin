import React from "react";
import { expect } from "chai";

import { flattenPluginsRoutes } from "../src/plugin";

describe("Plugin API", () => {
  describe("flattenPluginsRoutes()", () => {
    const fakeContent = <div className="content" />;
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
      expect(flattenPluginsRoutes(plugins)).to.have.a.lengthOf(3);
    });

    it("should map to Route components", () => {
      expect(flattenPluginsRoutes(plugins)[0])
        .to.have.property("type")
        .to.have.property("displayName")
        .eql("Connect(routeCreator)");
    });

    it("should forward the path prop", () => {
      expect(flattenPluginsRoutes(plugins)[0])
        .property("props")
        .property("path")
        .eql("/route/1");
    });
  });
});
