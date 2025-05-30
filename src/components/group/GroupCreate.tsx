import GroupForm from "./GroupForm";
import Spinner from "@src/components/Spinner";
import { useAppSelector } from "@src/hooks/app";
import React from "react";
import { useParams } from "react-router";

export default function GroupCreate() {
  const { bid } = useParams();
  const session = useAppSelector(state => state.session);

  if (session.busy) {
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
