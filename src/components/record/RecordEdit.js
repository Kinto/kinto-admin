import React, { Component } from "react";

import RecordForm from "./RecordForm";
import RecordTabs from "./RecordTabs";


export default class RecordEdit extends Component {
  onSubmit = ({__attachment__: attachment, ...record}) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, record, attachment);
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
        <h1>Edit <b>{bid}/{cid}/{rid}</b></h1>
        <RecordTabs
          bid={bid}
          cid={cid}
          rid={rid}
          selected="settings"
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
