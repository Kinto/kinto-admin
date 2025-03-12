/* Utils for tests. */
import * as notificationsHooks from "@src/hooks/notifications";
import { configureAppStoreAndHistory } from "@src/store/configureStore";
import { render } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React from "react";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { Route } from "react-router-dom";

export function mockNotifyError() {
  return vi
    .spyOn(notificationsHooks, "notifyError")
    .mockImplementation((...args) => {
      return args;
    });
}

export function mockNotifySuccess() {
  return vi
    .spyOn(notificationsHooks, "notifySuccess")
    .mockImplementation((...args) => {
      return args;
    });
}

export function sessionFactory(props = {}, capabilities = {}) {
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
      capabilities: {
        ...capabilities,
      },
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
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
