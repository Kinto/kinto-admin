/* @flow */
import type { Capabilities } from "../../types";

import { PureComponent } from "react";
import * as React from "react";

import { ReactComponent as GearIcon } from "bootstrap-icons/icons/gear.svg";
import { ReactComponent as LockIcon } from "bootstrap-icons/icons/lock.svg";
import { ReactComponent as JustifyIcon } from "bootstrap-icons/icons/justify.svg";
import { ReactComponent as ClockHistoryIcon } from "bootstrap-icons/icons/clock-history.svg";

import AdminLink from "../AdminLink";

type Props = {
  bid: string,
  cid: string,
  selected: "records" | "attributes" | "permissions" | "history",
  capabilities: Capabilities,
  children?: React.Node,
  totalRecords?: ?number,
};

export default class CollectionTabs extends PureComponent<Props> {
  render() {
    const {
      bid,
      cid,
      selected,
      capabilities,
      children,
      totalRecords,
    } = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li
            role="presentation"
            className={selected === "records" ? "active" : ""}>
            <AdminLink name="collection:records" params={{ bid, cid }}>
              <JustifyIcon className="icon" />
              Records {totalRecords ? `(${totalRecords})` : null}
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="collection:attributes" params={{ bid, cid }}>
              <GearIcon className="icon" />
              Attributes
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="collection:permissions" params={{ bid, cid }}>
              <LockIcon className="icon" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities && (
            <li
              role="presentation"
              className={selected === "history" ? "active" : ""}>
              <AdminLink name="collection:history" params={{ bid, cid }}>
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
