/* @flow */
import type { Capabilities } from "../../types";

import { PureComponent } from "react";
import * as React from "react";

import { ReactComponent as GearIcon } from "bootstrap-icons/icons/gear.svg";
import { ReactComponent as LockIcon } from "bootstrap-icons/icons/lock.svg";
import { ReactComponent as ClockHistoryIcon } from "bootstrap-icons/icons/clock-history.svg";

import AdminLink from "../AdminLink";

type Props = {
  bid: string,
  cid: string,
  rid: string,
  selected: "attributes" | "permissions" | "history",
  capabilities: Capabilities,
  children?: React.Element<*>,
};

export default class RecordTabs extends PureComponent<Props> {
  render() {
    const { bid, cid, rid, selected, capabilities, children } = this.props;

    return (
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item" role="presentation">
              <AdminLink
                name="record:attributes"
                params={{ bid, cid, rid }}
                className={
                  selected === "attributes" ? "nav-link active" : "nav-link"
                }>
                <GearIcon className="icon" />
                Attributes
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="record:permissions"
                params={{ bid, cid, rid }}
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
                  name="record:history"
                  params={{ bid, cid, rid }}
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
