import React, { Component } from "react";

import RecordForm from "./RecordForm";
import { cleanRecord } from "../utils";


export default class EditForm extends Component {
  onSubmit = (record) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, record);
  }

  render() {
    const {params, collection, record, deleteAttachment} = this.props;
    const {label} = collection;
    const {bid, cid, rid} = params;
    return (
      <div>
        <h1>Edit <b>{label}/{rid}</b></h1>
        <RecordForm
          bid={bid}
          cid={cid}
          rid={rid}
          collection={collection}
          record={cleanRecord(record)}
          deleteAttachment={deleteAttachment}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
}
