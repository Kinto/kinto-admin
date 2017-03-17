/* @flow */
import type { Capabilities } from "../../types";

import React, { PureComponent } from "react";

import AdminLink from "../AdminLink";

export default class GroupTabs extends PureComponent {
  props: {
    bid: string,
    gid: string,
    selected: "attributes" | "permissions" | "history",
    capabilities: Capabilities,
    children?: any,
  };

  render() {
    const { bid, gid, selected, capabilities, children } = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li
            role="presentation"
            className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="group:attributes" params={{ bid, gid }}>
              <i className="glyphicon glyphicon-cog" />
              Attributes
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="group:permissions" params={{ bid, gid }}>
              <i className="glyphicon glyphicon-lock" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities &&
            <li
              role="presentation"
              className={selected === "history" ? "active" : ""}>
              <AdminLink name="group:history" params={{ bid, gid }}>
                <i className="glyphicon glyphicon-time" />
                History
              </AdminLink>
            </li>}
        </ul>
        <div className="panel panel-default">
          <div className="panel-body">
            {children}
          </div>
        </div>
      </div>
    );
  }
}
