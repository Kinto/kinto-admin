/* Utils for tests. */

import React from "react";
import sinon from "sinon";
import { renderIntoDocument } from "react-dom/test-utils";
import { findDOMNode } from "react-dom";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import configureStore, { hashHistory } from "../src/store/configureStore";

export function createComponent(Component, props) {
  const store = configureStore();
  const comp = renderIntoDocument(
    <Provider store={store}>
      <ConnectedRouter history={hashHistory}>
        <Component {...props} />
      </ConnectedRouter>
    </Provider>
  );
  return findDOMNode(comp);
}

export function createSandbox() {
  const sandbox = sinon.createSandbox();
  // Ensure we catch any React warning and mark them as test failures.
  sandbox.stub(console, "error").callsFake((...args) => {
    throw new Error(args);
  });
  return sandbox;
}
