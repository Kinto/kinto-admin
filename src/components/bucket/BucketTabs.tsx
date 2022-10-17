import type { Capabilities } from "../../types";

import { PureComponent } from "react";
import * as React from "react";

import { Gear } from "react-bootstrap-icons";
import { Lock } from "react-bootstrap-icons";
import { Justify } from "react-bootstrap-icons";
import { PersonFill } from "react-bootstrap-icons";
import { ClockHistory } from "react-bootstrap-icons";

import AdminLink from "../AdminLink";

type Props = {
  bid: string;
  selected: "collections" | "groups" | "attributes" | "permissions" | "history";
  capabilities: Capabilities;
  children?: React.ReactNode;
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
                }
              >
                <Justify className="icon" />
                Collections
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="bucket:groups"
                params={{ bid }}
                className={
                  selected === "groups" ? "nav-link active" : "nav-link"
                }
              >
                <PersonFill className="icon" />
                Groups
              </AdminLink>
            </li>
            <li className="nav-item" role="presentation">
              <AdminLink
                name="bucket:attributes"
                params={{ bid }}
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
                name="bucket:permissions"
                params={{ bid }}
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
                  name="bucket:history"
                  params={{ bid }}
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
}
