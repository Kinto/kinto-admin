import Spinner from "../Spinner";
import RecordForm from "./RecordForm";
import RecordTabs from "./RecordTabs";
import * as CollectionActions from "@src/actions/collection";
import { useCollection } from "@src/hooks/collection";
import { useRecord } from "@src/hooks/record";
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
  bucket: BucketState;
  collection: CollectionState;
  record: RecordState;
};

export type Props = OwnProps &
  StateProps & {
    deleteRecord: typeof CollectionActions.deleteRecord;
    deleteAttachment: typeof CollectionActions.deleteAttachment;
    updateRecord: typeof CollectionActions.updateRecord;
  };

export default function RecordAttributes({
  session,
  capabilities,
  deleteRecord,
  deleteAttachment,
  updateRecord,
}: Props) {
  const { bid, cid, rid } = useParams();

  const onSubmit = ({ __attachment__: attachment, ...recordData }: any) => {
    updateRecord(bid, cid, rid, { data: recordData }, attachment);
  };

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
          onSubmit={onSubmit}
          capabilities={capabilities}
        />
      </RecordTabs>
    </div>
  );
}
