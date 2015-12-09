import { expect } from "chai";
import React from "react";

import { setupContainer, nodeText, nodeTexts } from "../test-utils";
import Sidebar from "../../scripts/containers/Sidebar";


describe("Sidebar container", () => {
  it("should render the navigation menu", () => {
    const props = {params: {name: "/addons"}, location: {pathname: "/addons"}};
    const comp = setupContainer(<Sidebar {...props} />);

    expect(nodeTexts(comp, "li")).eql([
      "Home",
      "Settings",
      "addons",
      "certificates",
      "gfx",
      "plugins",
    ]);
  });

  it("should highlight the homepage menu entry when on the homepage", () => {
    const props = {params: {}, location: {pathname: "/"}};
    const comp = setupContainer(<Sidebar {...props} />);

    expect(nodeText(comp, "li.active a")).eql("Home");
  });

  it("should highlight the settings menu entry when on settings", () => {
    const props = {params: {}, location: {pathname: "/settings"}};
    const comp = setupContainer(<Sidebar {...props} />);

    expect(nodeText(comp, "li.active a")).eql("Settings");
  });

  it("should highlight a collection menu entry when selected", () => {
    const props = {params: {name: "addons"}, location: {pathname: "/addons"}};
    const comp = setupContainer(<Sidebar {...props} />);

    expect(nodeText(comp, "li.active a")).eql("addons");
  });

  it("should denote an unsynced collection", () => {
    const props = {params: {name: "addons"}, location: {pathname: "/addons"}};
    const comp = setupContainer(<Sidebar {...props} />, {
      collections: {
        addons: {
          name: "addons",
          synced: false,
        }
      }
    });

    expect(nodeText(comp, "li a.unsynced")).eql("addons");
  });
});

