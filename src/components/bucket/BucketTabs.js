/* @flow */
import type { Capabilities } from "../../types";

import { PureComponent } from "react";
import * as React from "react";

import { ReactComponent as GearIcon } from "bootstrap-icons/icons/gear.svg";
import { ReactComponent as LockIcon } from "bootstrap-icons/icons/lock.svg";
import { ReactComponent as JustifyIcon } from "bootstrap-icons/icons/justify.svg";
import { ReactComponent as PersonFillIcon } from "bootstrap-icons/icons/person-fill.svg";
import { ReactComponent as ClockHistoryIcon } from "bootstrap-icons/icons/clock-history.svg";

import AdminLink from "../AdminLink";

type Props = {
  bid: string,
  selected: "collections" | "groups" | "attributes" | "permissions" | "history",
  capabilities: Capabilities,
  children?: React.Node,
};

export default class BucketTabs extends PureComponent<Props> {
  render() {
    const { bid, selected, capabilities, children } = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li
            role="presentation"
            className={selected === "collections" ? "active" : ""}>
            <AdminLink name="bucket:collections" params={{ bid }}>
              <JustifyIcon className="icon" />
              Collections
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "groups" ? "active" : ""}>
            <AdminLink name="bucket:groups" params={{ bid }}>
              <PersonFillIcon className="icon" />
              Groups
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="bucket:attributes" params={{ bid }}>
              <GearIcon className="icon" />
              Attributes
            </AdminLink>
          </li>
          <li
            role="presentation"
            className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="bucket:permissions" params={{ bid }}>
              <LockIcon className="icon" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities && (
            <li
              role="presentation"
              className={selected === "history" ? "active" : ""}>
              <AdminLink name="bucket:history" params={{ bid }}>
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
