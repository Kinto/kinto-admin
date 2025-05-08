import RecordForm from "./RecordForm";
import RecordTabs from "./RecordTabs";
import * as CollectionActions from "@src/actions/collection";
import type {
  BucketState,
  Capabilities,
  CollectionState,
  RecordRouteMatch,
  RecordState,
  SessionState,
} from "@src/types";
import React from "react";
import { useParams } from "react-router";

export type OwnProps = {
  match: RecordRouteMatch;
};

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    deleteRecord: typeof CollectionActions.deleteRecord;
    deleteAttachment: typeof CollectionActions.deleteAttachment;
  };

export default function RecordAttributes({
  session,
  capabilities,
  deleteRecord,
  deleteAttachment,
}: Props) {
  const { bid, cid, rid } = useParams();

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid}/{rid}
        </b>{" "}
        record attributes
      </h1>
      <RecordTabs
        bid={bid}
        cid={cid}
        rid={rid}
        selected="attributes"
        capabilities={capabilities}
      >
        <RecordForm
          session={session}
          deleteRecord={deleteRecord}
          deleteAttachment={deleteAttachment}
          capabilities={capabilities}
        />
      </RecordTabs>
    </div>
  );
}
