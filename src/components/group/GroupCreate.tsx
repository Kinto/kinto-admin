import GroupForm from "./GroupForm";
import Spinner from "@src/components/Spinner";
import { useServerInfo } from "@src/hooks/session";
import React from "react";
import { useParams } from "react-router";

export default function GroupCreate() {
  const { bid } = useParams();
  const serverInfo = useServerInfo();

  if (!serverInfo) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>
        Create a new group in <b>{bid}</b> bucket
      </h1>
      <div className="card">
        <div className="card-body">
          <GroupForm />
        </div>
      </div>
    </div>
  );
}
