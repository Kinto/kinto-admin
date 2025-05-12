import BucketForm from "./BucketForm";
import Spinner from "@src/components/Spinner";
import { useAppSelector } from "@src/hooks/app";
import React from "react";

export default function BucketCreate() {
  const session = useAppSelector(state => state.session);

  if (session.busy || session.authenticating) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>Create a new bucket</h1>
      <div className="card">
        <div className="card-body">
          <BucketForm />
        </div>
      </div>
    </div>
  );
}
