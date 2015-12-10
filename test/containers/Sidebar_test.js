import { expect } from "chai";
import React from "react";

import { setupContainer, nodeText, nodeTexts } from "../test-utils";
import Sidebar from "../../scripts/containers/Sidebar";
import * as CollectionsActions from "../../scripts/actions/collections";
import defaultCollections from "../../config/config.json";


describe("Sidebar container", () => {
  it("should render the navigation menu", () => {
    const props = {params: {name: "/tasks"}, location: {pathname: "/tasks"}};
    const comp = setupContainer(<Sidebar {...props} />);
    comp.store.dispatch(CollectionsActions.collectionsListReceived(defaultCollections));

    expect(nodeTexts(comp, "li")).eql([
      "Home",
      "Settings",
      "tasks",
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
    const props = {params: {name: "tasks"}, location: {pathname: "/tasks"}};
    const comp = setupContainer(<Sidebar {...props} />);
    comp.store.dispatch(CollectionsActions.collectionsListReceived(defaultCollections));

    expect(nodeText(comp, "li.active a")).eql("tasks");
  });

  it("should denote an unsynced collection", () => {
    const props = {params: {name: "tasks"}, location: {pathname: "/tasks"}};
    const comp = setupContainer(<Sidebar {...props} />, {
      collections: {
        tasks: {
          name: "tasks",
          synced: false,
        }
      }
    });

    expect(nodeText(comp, "li a.unsynced")).eql("tasks");
  });
});

