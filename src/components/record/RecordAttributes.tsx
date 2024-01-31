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
  match,
  session,
  capabilities,
  bucket,
  collection,
  record,
  deleteRecord,
  deleteAttachment,
  updateRecord,
}: Props) {
  const {
    params: { bid, cid, rid },
  } = match;

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
          bid={bid}
          cid={cid}
          rid={rid}
          session={session}
          bucket={bucket}
          collection={collection}
          record={record}
          deleteRecord={deleteRecord}
          deleteAttachment={deleteAttachment}
          onSubmit={onSubmit}
          capabilities={capabilities}
        />
      </RecordTabs>
    </div>
  );
}
