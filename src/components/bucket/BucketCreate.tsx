import BucketForm from "./BucketForm";
import Spinner from "@src/components/Spinner";
import { useServerInfo } from "@src/hooks/session";
import React from "react";

export default function BucketCreate() {
  const serverInfo = useServerInfo();

  if (!serverInfo) {
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
