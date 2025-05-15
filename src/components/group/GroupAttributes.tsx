import GroupForm from "./GroupForm";
import GroupTabs from "./GroupTabs";
import React from "react";
import { useParams } from "react-router";

export default function GroupAttributes() {
  const { bid, gid } = useParams();

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{gid}
        </b>{" "}
        group attributes
      </h1>
      <GroupTabs bid={bid} gid={gid} selected="attributes">
        <GroupForm />
      </GroupTabs>
    </div>
  );
}
