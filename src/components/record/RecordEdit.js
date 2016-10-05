import React, { Component } from "react";

import RecordForm from "./RecordForm";


export default class RecordEdit extends Component {
  onSubmit = ({__attachment__: attachment, ...record}) => {
    const {params, updateRecord, record: loadedRecord} = this.props;
    const {bid, cid, rid} = params;
    const {data} = loadedRecord;
    const {last_modified} = data;
    const savedRecord = {...record, last_modified};
    updateRecord(bid, cid, rid, savedRecord, attachment);
  }

  render() {
    const {
      params,
      session,
      bucket,
      collection,
      record,
      deleteRecord,
      deleteAttachment
    } = this.props;
    const {bid, cid, rid} = params;

    return (
      <div>
        <h1>Edit <b>{bid}/{cid}/{rid}</b></h1>
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
      </div>
    );
  }
}
