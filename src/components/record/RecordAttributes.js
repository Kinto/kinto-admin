/* @flow */
import type {
  SessionState,
  BucketState,
  CollectionState,
  RecordState,
  RouteParams,
} from "../../types";

import React, { Component } from "react";

import RecordForm from "./RecordForm";
import RecordTabs from "./RecordTabs";


export default class RecordAttributes extends Component {
  props: {
    params: RouteParams,
    session: SessionState,
    capabilities: Object,
    bucket: BucketState,
    collection: CollectionState,
    record: RecordState,
    deleteRecord: Function,
    deleteAttachment: Function,
    updateRecord: Function,
  };

  onSubmit = ({__attachment__: attachment, ...record}: Object) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, {data: record}, attachment);
  }

  render() {
    const {
      params,
      session,
      capabilities,
      bucket,
      collection,
      record,
      deleteRecord,
      deleteAttachment,
    } = this.props;
    const {bid, cid, rid} = params;

    return (
      <div>
        <h1>Edit <b>{bid}/{cid}/{rid}</b> record attributes</h1>
        <RecordTabs
          bid={bid}
          cid={cid}
          rid={rid}
          selected="attributes"
          capabilities={capabilities}>
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
            onSubmit={this.onSubmit} />
        </RecordTabs >
      </div>
    );
  }
}
