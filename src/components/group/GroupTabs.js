/* @flow */
import type { Capabilities } from "../../types";

import React, { PureComponent } from "react";

import { ReactComponent as GearIcon } from "bootstrap-icons/icons/gear.svg";
import { ReactComponent as LockIcon } from "bootstrap-icons/icons/lock.svg";
import { ReactComponent as ClockHistoryIcon } from "bootstrap-icons/icons/clock-history.svg";

import AdminLink from "../AdminLink";

type Props = {
  bid: string,
  gid: string,
  selected: "attributes" | "permissions" | "history",
  capabilities: Capabilities,
  children?: any,
};

export default class GroupTabs extends PureComponent<Props> {
  render() {
    const { bid, gid, selected, capabilities, children } = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li
            role="presentation"
            className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="group:attributes" params={{ bid, gid }}>
              <GearIcon className="icon" />
              Attributes
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="group:permissions" params={{ bid, gid }}>
              <LockIcon className="icon" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities && (
            <li
              role="presentation"
              className={selected === "history" ? "active" : ""}>
              <AdminLink name="group:history" params={{ bid, gid }}>
                <ClockHistoryIcon className="icon" />
                History
              </AdminLink>
            </li>
          )}
        </ul>
        <div className="panel panel-default">
          <div className="panel-body">{children}</div>
        </div>
      </div>
    );
  }
}
