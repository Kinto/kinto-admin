/* Utils for tests. */

import React from "react";
import { render } from "@testing-library/react";
import { Router } from "react-router";
import { Provider } from "react-redux";
import { configureAppStoreAndHistory } from "../src/store/configureStore";
import * as notificationsActions from "../src/actions/notifications";
import { createMemoryHistory } from "history";
import { Route } from "react-router-dom";


export function mockNotifyError() {
  return vi
    .spyOn(notificationsActions, "notifyError")
    .mockImplementation((...args) => {
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

export function renderWithProvider(
  ui,
  {
    initialState,
    route = "/",
    path = "/",
    initialHistory = createMemoryHistory({ initialEntries: [route] }),
    ...renderOptions
  } = {}
) {
  const { store, history } = configureAppStoreAndHistory(
    initialState,
    initialHistory
  );
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <Router history={history}>
        <Route path={path}>{children}</Route>
      </Router>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
