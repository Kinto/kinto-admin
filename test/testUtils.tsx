/* Utils for tests. */
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as notificationsHooks from "@src/hooks/notifications";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

export const SERVERINFO_WITH_ATTACHMENTS_CAPABILITY = {
  ...DEFAULT_SERVERINFO,
  capabilities: {
    attachments: {},
  },
};

export const SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES = {
  ...DEFAULT_SERVERINFO,
  capabilities: {
    signer: {},
    openid: {},
    history: {
      excluded_resources: [],
    },
  },
};

export function mockNotifyError() {
  return vi
    .spyOn(notificationsHooks, "notifyError")
    .mockImplementation((...args) => {
      return args;
    });
}

export function mockNotifyInfo() {
  return vi
    .spyOn(notificationsHooks, "notifyInfo")
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
  interface Props {
    children: JSX.Element[];
  }
  const Wrapper = ({ children }: Props) => (
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
