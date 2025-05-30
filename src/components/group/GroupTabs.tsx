import AdminLink from "@src/components/AdminLink";
import { useAppSelector } from "@src/hooks/app";
import React from "react";
import { Gear } from "react-bootstrap-icons";
import { Lock } from "react-bootstrap-icons";
import { ClockHistory } from "react-bootstrap-icons";

type Props = {
  bid: string;
  gid: string;
  selected: "attributes" | "permissions" | "history";
  children?: any;
};

export default function GroupTabs(props: Props) {
  const session = useAppSelector(state => state.session);
  const { bid, gid, selected, children } = props;

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
          {"history" in session.serverInfo.capabilities && (
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
