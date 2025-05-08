import RecordForm from "./RecordForm";
import * as CollectionActions from "@src/actions/collection";
import type {
  BucketState,
  Capabilities,
  CollectionState,
  SessionState,
} from "@src/types";
import React, { useCallback } from "react";
import { useParams } from "react-router";

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

export default function RecordCreate({ session, capabilities }: StateProps) {
  const { bid, cid } = useParams();

  return (
    <div>
      <h1>
        Add a new record in{" "}
        <b>
          {bid}/{cid}
        </b>
      </h1>
      <div className="card">
        <div className="card-body">
          <RecordForm session={session} capabilities={capabilities} />
        </div>
      </div>
    </div>
  );
}
