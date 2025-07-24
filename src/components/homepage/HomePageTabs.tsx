import AdminLink from "@src/components/AdminLink";
import React from "react";
import { Folder, InfoCircle } from "react-bootstrap-icons";

type Props = {
  selected: "serverinfo" | "buckets";
  children?: any;
};

export default function HomePageTabs(props: Props) {
  const { selected, children } = props;

  return (
    <div className="card">
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item" role="presentation">
            <AdminLink
              name="home"
              params={{}}
              className={
                selected === "serverinfo" ? "nav-link active" : "nav-link"
              }
            >
              <InfoCircle className="icon" />
              Server Information
            </AdminLink>
          </li>
          <li className="nav-item" role="presentation">
            <AdminLink
              name="buckets"
              params={{}}
              className={
                selected === "buckets" ? "nav-link active" : "nav-link"
              }
            >
              <Folder className="icon" />
              Buckets
            </AdminLink>
          </li>
        </ul>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
