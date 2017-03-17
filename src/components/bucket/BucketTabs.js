/* @flow */
import type { Capabilities } from "../../types";

import React, { PureComponent } from "react";

import AdminLink from "../AdminLink";

export default class BucketTabs extends PureComponent {
  props: {
    bid: string,
    selected:
      | "collections"
      | "groups"
      | "attributes"
      | "permissions"
      | "history",
    capabilities: Capabilities,
    children?: React.Element<*>,
  };

  render() {
    const { bid, selected, capabilities, children } = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li
            role="presentation"
            className={selected === "collections" ? "active" : ""}>
            <AdminLink name="bucket:collections" params={{ bid }}>
              <i className="glyphicon glyphicon-align-justify" />
              Collections
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "groups" ? "active" : ""}>
            <AdminLink name="bucket:groups" params={{ bid }}>
              <i className="glyphicon glyphicon-user" />
              Groups
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="bucket:attributes" params={{ bid }}>
              <i className="glyphicon glyphicon-cog" />
              Attributes
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="bucket:permissions" params={{ bid }}>
              <i className="glyphicon glyphicon-lock" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities &&
            <li
              role="presentation"
              className={selected === "history" ? "active" : ""}>
              <AdminLink name="bucket:history" params={{ bid }}>
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
