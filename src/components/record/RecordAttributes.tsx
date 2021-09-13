import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  RecordState,
  RecordRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import * as CollectionActions from "../../actions/collection";
import RecordForm from "./RecordForm";
import RecordTabs from "./RecordTabs";

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

export default class RecordAttributes extends PureComponent<Props> {
  onSubmit = ({ __attachment__: attachment, ...record }: any) => {
    const { match, updateRecord } = this.props;
    const {
      params: { bid, cid, rid },
    } = match;
    updateRecord(bid, cid, rid, { data: record }, attachment);
  };

  render() {
    const {
      match,
      session,
      capabilities,
      bucket,
      collection,
      record,
      deleteRecord,
      deleteAttachment,
    } = this.props;
    const {
      params: { bid, cid, rid },
    } = match;

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
            onSubmit={this.onSubmit}
            capabilities={capabilities}
          />
        </RecordTabs>
      </div>
    );
  }
}
