/* @flow */
import type { Capabilities } from "../../types";

import React, { PureComponent } from "react";

import AdminLink from "../AdminLink";

export default class RecordTabs extends PureComponent {
  props: {
    bid: string,
    cid: string,
    rid: string,
    selected: "attributes" | "permissions" | "history",
    capabilities: Capabilities,
    children?: React.Element<*>,
  };

  render() {
    const { bid, cid, rid, selected, capabilities, children } = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li
            role="presentation"
            className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="record:attributes" params={{ bid, cid, rid }}>
              <i className="glyphicon glyphicon-cog" />
              Attributes
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="record:permissions" params={{ bid, cid, rid }}>
              <i className="glyphicon glyphicon-lock" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities &&
            <li
              role="presentation"
              className={selected === "history" ? "active" : ""}>
              <AdminLink name="record:history" params={{ bid, cid, rid }}>
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
