import { expect } from "chai";
import React from "react";
import { renderIntoDocument } from "react-addons-test-utils";
import { findDOMNode } from "react-dom";

import App from "../../scripts/components/App";


describe("App component", () => {
  it("should add a class when notifications are provided", () => {
    const session = {authenticated: false};
    const comp = renderIntoDocument(
      <App session={session} notificationList={[{message: "blah"}]}/>);
    const node = findDOMNode(comp);
    const contentNode = node.querySelector(".content");

    expect(contentNode.classList.contains("with-notifications")).eql(true);
  });
});
