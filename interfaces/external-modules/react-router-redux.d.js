import type { Middleware } from "redux";

declare module "react-router-redux" {
  declare var exports: {
    routerMiddleware: Middleware,
    routerReducer: Function,
    syncHistoryWithStore: Function,
    push: Function,
  };
}
