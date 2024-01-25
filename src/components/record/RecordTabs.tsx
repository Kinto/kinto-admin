import type { Capabilities } from "../../types";
import AdminLink from "../AdminLink";
import React from "react";
import { Gear } from "react-bootstrap-icons";
import { Lock } from "react-bootstrap-icons";
import { ClockHistory } from "react-bootstrap-icons";

type Props = {
  bid: string;
  cid: string;
  rid: string;
  selected: "attributes" | "permissions" | "history";
  capabilities: Capabilities;
  children?: React.ReactNode;
};

export default function RecordTabs({
  bid,
  cid,
  rid,
  selected,
  capabilities,
  children,
}: Props) {
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
              }
            >
              <Gear className="icon" />
              Attributes
            </AdminLink>
          </li>
          <li className="nav-item" role="presentation">
            <AdminLink
              name="record:permissions"
              params={{ bid, cid, rid }}
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
                name="record:history"
                params={{ bid, cid, rid }}
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
