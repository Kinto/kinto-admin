import type { Capabilities } from "../../types";

import React from "react";

import { Gear, Lock, Justify, PersonFill, ClockHistory } from "react-bootstrap-icons";
import AdminLink from "../AdminLink";

type Props = {
  bid: string;
  selected: "collections" | "groups" | "attributes" | "permissions" | "history";
  capabilities: Capabilities;
  children?: React.ReactNode;
};

const BucketTabs: React.FC<Props> = ({ bid, selected, capabilities, children }) => {
  return (
    <div className="card">
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          {[
            { name: "bucket:collections", icon: Justify, label: "Collections", key: "collections" },
            { name: "bucket:groups", icon: PersonFill, label: "Groups", key: "groups" },
            { name: "bucket:attributes", icon: Gear, label: "Attributes", key: "attributes" },
            { name: "bucket:permissions", icon: Lock, label: "Permissions", key: "permissions" }
          ].map(({ name, icon: Icon, label, key }) => (
            <li className="nav-item" role="presentation" key={key}>
              <AdminLink
                name={name}
                params={{ bid }}
                className={selected === key ? "nav-link active" : "nav-link"}
              >
                <Icon className="icon" />
                {label}
              </AdminLink>
            </li>
          ))}
          {"history" in capabilities && (
            <li className="nav-item" role="presentation">
              <AdminLink
                name="bucket:history"
                params={{ bid }}
                className={selected === "history" ? "nav-link active" : "nav-link"}
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
};

export default BucketTabs;
