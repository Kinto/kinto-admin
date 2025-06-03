/* Utils for tests. */
import * as notificationsHooks from "@src/hooks/notifications";
import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";

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

export function renderWithRouter(
  ui,
  { route = "/", path = "/", createRoutes = true, ...renderOptions } = {}
) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      {createRoutes && (
        <Routes>
          <Route path={path} element={children} />
        </Routes>
      )}
      {!createRoutes && children}
    </MemoryRouter>
  );
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
