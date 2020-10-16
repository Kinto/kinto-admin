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
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item" role="presentation">
              <AdminLink
                name="collection:records"
                params={{ bid, cid }}
                className={
                  selected === "records" ? "nav-link active" : "nav-link"
                }>
                <JustifyIcon className="icon" />
                Records {totalRecords ? `(${totalRecords})` : null}
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="collection:attributes"
                params={{ bid, cid }}
                className={
                  selected === "attributes" ? "nav-link active" : "nav-link"
                }>
                <GearIcon className="icon" />
                Attributes
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="collection:permissions"
                params={{ bid, cid }}
                className={
                  selected === "permissions" ? "nav-link active" : "nav-link"
                }>
                <LockIcon className="icon" />
                Permissions
              </AdminLink>
            </li>
            {"history" in capabilities && (
              <li className="nav-item" role="presentation">
                <AdminLink
                  name="collection:history"
                  params={{ bid, cid }}
                  className={
                    selected === "history" ? "nav-link active" : "nav-link"
                  }>
                  <ClockHistoryIcon className="icon" />
                  History
                </AdminLink>
              </li>
            )}
          </ul>
        </div>
        <div className="card-body">{children}</div>
      </div>
    );
  }
}
