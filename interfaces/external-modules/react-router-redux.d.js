import type { Middleware } from "redux";

declare module "react-router-redux" {
  declare module.exports: {
    routerMiddleware: Middleware,
    routerReducer: Function,
    syncHistoryWithStore: Function,
    push: Function,
  };
}
