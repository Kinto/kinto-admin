import React from "react";
import {
  Gear,
  Lock,
  Justify,
  ClockHistory,
  Braces,
} from "react-bootstrap-icons";

import AdminLink from "../AdminLink";
import type { Capabilities } from "../../types";
import { storageKeys, useLocalStorage } from "../../hooks/storage";

type Props = {
  bid: string;
  cid: string;
  selected:
    | "records"
    | "attributes"
    | "permissions"
    | "history"
    | "simple-review";
  capabilities: Capabilities;
  children?: React.ReactNode;
  totalRecords?: number | null;
};

export default function CollectionTabs({
  bid,
  cid,
  selected,
  capabilities,
  children,
  totalRecords,
}: Props) {
  const [useSimpleReview] = useLocalStorage(storageKeys.useSimpleReview, true);

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
              }
            >
              <Justify className="icon" />
              Records {totalRecords ? `(${totalRecords})` : null}
            </AdminLink>
          </li>
          {capabilities.signer && useSimpleReview && (
            <li className="nav-item" role="presentation">
              <AdminLink
                name="collection:simple-review"
                params={{ bid, cid }}
                className={
                  selected === "simple-review" ? "nav-link active" : "nav-link"
                }
              >
                <Braces className="icon" />
                Review
              </AdminLink>
            </li>
          )}
          <li className="nav-item" role="presentation">
            <AdminLink
              name="collection:attributes"
              params={{ bid, cid }}
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
              name="collection:permissions"
              params={{ bid, cid }}
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
                name="collection:history"
                params={{ bid, cid }}
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
