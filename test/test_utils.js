/* Utils for tests. */

import React from "react";
import sinon from "sinon";
import ReactDOM from "react-dom";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import configureStore, { hashHistory } from "../src/store/configureStore";
import * as notificationsActions from "../src/actions/notifications";

export function createComponent(
  ui,
  { initialState, store = configureStore(initialState) } = {}
) {
  const domContainer = document.createElement("div");
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={hashHistory}>{ui}</ConnectedRouter>
    </Provider>,
    domContainer
  );
  return domContainer.children.length == 0 ? null : domContainer;
}

export function createSandbox() {
  const sandbox = sinon.createSandbox();
  // Ensure we catch any React warning and mark them as test failures.
  sandbox.stub(console, "error").callsFake((...args) => {
    throw new Error(args);
  });
  return sandbox;
}

export function mockNotifyError(sandbox) {
  return sandbox
    .stub(notificationsActions, "notifyError")
    .callsFake((...args) => {
      return args;
    });
}

export function sessionFactory(props) {
  return {
    busy: false,
    authenticating: false,
    auth: {
      authType: "basicauth",
      server: "asdasd",
      credentials: {
        username: "user",
        password: "123",
      },
    },
    authenticated: true,
    permissions: [],
    buckets: [],
    serverInfo: {
      url: "",
      project_name: "foo",
      project_docs: "foo",
      capabilities: {},
      user: {
        id: "user1",
        principals: [`/buckets/main-workspace/groups/my-collection-reviewers`],
      },
    },
    ...props,
    redirectURL: "",
  };
}
