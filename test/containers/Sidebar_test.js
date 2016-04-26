import { expect } from "chai";
import React from "react";

import { setupContainer, nodeText, nodeTexts } from "../test-utils";
import Sidebar from "../../scripts/containers/Sidebar";
import * as CollectionsActions from "../../scripts/actions/collections";
import jsonConfig from "../../config/config.json";


const {collections} = jsonConfig;

describe("Sidebar container", () => {
  it("should render the navigation menu", () => {
    const props = {params: {name: "/tasks"}, location: {pathname: "/tasks"}};
    const comp = setupContainer(<Sidebar {...props} />);
    comp.store.dispatch(CollectionsActions.collectionsListReceived(collections));

    expect(nodeTexts(comp, "a")).eql([
      "Home",
      "Settings",
      "tasks",
    ]);
  });

  it("should highlight the homepage menu entry when on the homepage", () => {
    const props = {params: {}, location: {pathname: "/"}};
    const comp = setupContainer(<Sidebar {...props} />);

    expect(nodeText(comp, "a.active")).eql("Home");
  });

  it("should highlight the settings menu entry when on settings", () => {
    const props = {params: {}, location: {pathname: "/settings"}};
    const comp = setupContainer(<Sidebar {...props} />);

    expect(nodeText(comp, "a.active")).eql("Settings");
  });

  it("should highlight a collection menu entry when selected", () => {
    const props = {params: {name: "tasks"}, location: {pathname: "/tasks"}};
    const comp = setupContainer(<Sidebar {...props} />);
    comp.store.dispatch(CollectionsActions.collectionsListReceived(collections));

    expect(nodeText(comp, "a.active")).eql("tasks");
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

    expect(nodeText(comp, "a.active")).eql("tasks*");
  });
});

