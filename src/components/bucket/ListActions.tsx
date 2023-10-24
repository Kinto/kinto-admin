import React from "react";
import AdminLink from "../AdminLink";

export default function ListActions(props) {
  const { bid, session, bucket } = props;
  if (session.busy || bucket.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      <AdminLink
        name="collection:create"
        params={{ bid }}
        className="btn btn-info btn-collection-add"
      >
        Create collection
      </AdminLink>
    </div>
  );
}
