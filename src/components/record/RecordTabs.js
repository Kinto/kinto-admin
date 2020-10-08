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
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li
            role="presentation"
            className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="record:attributes" params={{ bid, cid, rid }}>
              <GearIcon className="icon" />
              Attributes
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="record:permissions" params={{ bid, cid, rid }}>
              <LockIcon className="icon" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities && (
            <li
              role="presentation"
              className={selected === "history" ? "active" : ""}>
              <AdminLink name="record:history" params={{ bid, cid, rid }}>
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
