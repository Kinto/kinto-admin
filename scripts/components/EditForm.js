import React, { Component } from "react";

import RecordForm from "./RecordForm";


export default class EditForm extends Component {
  onSubmit = (record) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, record);
  }

  render() {
    const {params, session, collection, record, deleteAttachment} = this.props;
    const {bid, cid, rid} = params;
    return (
      <div>
        <h1>Edit <b>{bid}/{cid}/{rid}</b></h1>
        <RecordForm
          bid={bid}
          cid={cid}
          rid={rid}
          session={session}
          collection={collection}
          record={record}
          deleteAttachment={deleteAttachment}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
}
