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
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item" role="presentation">
              <AdminLink
                name="bucket:collections"
                params={{ bid }}
                className={
                  selected === "collections" ? "nav-link active" : "nav-link"
                }>
                <JustifyIcon className="icon" />
                Collections
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="bucket:groups"
                params={{ bid }}
                className={
                  selected === "groups" ? "nav-link active" : "nav-link"
                }>
                <PersonFillIcon className="icon" />
                Groups
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="bucket:attributes"
                params={{ bid }}
                className={
                  selected === "attributes" ? "nav-link active" : "nav-link"
                }>
                <GearIcon className="icon" />
                Attributes
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="bucket:permissions"
                params={{ bid }}
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
                  name="bucket:history"
                  params={{ bid }}
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
