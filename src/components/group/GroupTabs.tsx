import type { Capabilities } from "../../types";

import React from "react";

import { Gear } from "react-bootstrap-icons";
import { Lock } from "react-bootstrap-icons";
import { ClockHistory } from "react-bootstrap-icons";

import AdminLink from "../AdminLink";

type Props = {
  bid: string;
  gid: string;
  selected: "attributes" | "permissions" | "history";
  capabilities: Capabilities;
  children?: any;
};

export default function GroupTabs(props: Props) {
  const { bid, gid, selected, capabilities, children } = props;

  return (
    <div className="card">
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item" role="presentation">
            <AdminLink
              name="group:attributes"
              params={{ bid, gid }}
              className={
                selected === "attributes" ? "nav-link active" : "nav-link"
              }
            >
              <Gear className="icon" />
              Attributes
            </AdminLink>
          </li>
          <li className="nav-item" role="presentation">
            <AdminLink
              name="group:permissions"
              params={{ bid, gid }}
              className={
                selected === "permissions" ? "nav-link active" : "nav-link"
              }
            >
              <Lock className="icon" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities && (
            <li className="nav-item" role="presentation">
              <AdminLink
                name="group:history"
                params={{ bid, gid }}
                className={
                  selected === "history" ? "nav-link active" : "nav-link"
                }
              >
                <ClockHistory className="icon" />
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
